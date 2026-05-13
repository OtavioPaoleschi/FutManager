import { get, put } from '@vercel/blob';

const MAX_BODY_BYTES = Number(process.env.MAX_STATE_BYTES || 5 * 1024 * 1024);
const STATE_PATH = process.env.FUT_STATE_PATH || 'fut-manager/state.json';
const BLOB_ACCESS = process.env.FUT_BLOB_ACCESS || process.env.BLOB_ACCESS || 'public';

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

function assertBlobConfig() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN não configurado. Crie/conecte um Vercel Blob ao projeto.');
  }

  if (!['public', 'private'].includes(BLOB_ACCESS)) {
    throw new Error('FUT_BLOB_ACCESS precisa ser "public" ou "private".');
  }
}

async function streamToText(stream) {
  if (!stream) return '';
  return new Response(stream).text();
}

async function readState() {
  assertBlobConfig();

  const result = await get(STATE_PATH, {
    access: BLOB_ACCESS,
    headers: { 'cache-control': 'no-cache' },
  });

  if (!result || result.statusCode === 404 || !result.stream) {
    return {
      data: null,
      updatedAt: null,
      etag: null,
      pathname: STATE_PATH,
      access: BLOB_ACCESS,
    };
  }

  const raw = await streamToText(result.stream);
  const parsed = raw ? JSON.parse(raw) : null;
  const data = parsed && Object.prototype.hasOwnProperty.call(parsed, 'data') ? parsed.data : parsed;

  return {
    data,
    updatedAt: parsed?.updatedAt || result.blob?.uploadedAt || null,
    etag: result.blob?.etag || null,
    pathname: result.blob?.pathname || STATE_PATH,
    access: BLOB_ACCESS,
  };
}

async function parseBody(request) {
  const raw = await request.text();
  const bytes = Buffer.byteLength(raw || '', 'utf8');

  if (bytes > MAX_BODY_BYTES) {
    const mb = Math.round(MAX_BODY_BYTES / 1024 / 1024);
    throw new Error(`Payload maior que o limite configurado de ${mb} MB.`);
  }

  return raw ? JSON.parse(raw) : {};
}

async function writeState(request) {
  assertBlobConfig();

  const body = await parseBody(request);
  if (!body || typeof body !== 'object' || !Object.prototype.hasOwnProperty.call(body, 'data')) {
    return json({ ok: false, error: 'Envie JSON no formato { "data": ... }.' }, 400);
  }

  const envelope = {
    app: 'fut-manager',
    updatedAt: new Date().toISOString(),
    data: body.data,
  };

  const serialized = JSON.stringify(envelope, null, 2);
  const blob = await put(STATE_PATH, serialized, {
    access: BLOB_ACCESS,
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
    cacheControlMaxAge: 60,
  });

  return json({
    ok: true,
    storage: 'vercel-blob',
    data: body.data,
    updatedAt: envelope.updatedAt,
    path: blob.pathname,
    etag: blob.etag || null,
    access: BLOB_ACCESS,
  });
}

export async function GET() {
  try {
    const state = await readState();
    return json({ ok: true, storage: 'vercel-blob', ...state });
  } catch (error) {
    const message = error?.message || 'Erro interno.';
    if (/not found|BlobNotFound|404/i.test(message)) {
      return json({ ok: true, storage: 'vercel-blob', data: null, updatedAt: null, path: STATE_PATH, access: BLOB_ACCESS });
    }
    console.error(error);
    return json({ ok: false, storage: 'vercel-blob', error: message }, 500);
  }
}

export async function PUT(request) {
  try {
    return await writeState(request);
  } catch (error) {
    console.error(error);
    return json({ ok: false, storage: 'vercel-blob', error: error?.message || 'Erro interno.' }, 500);
  }
}

export async function POST(request) {
  return PUT(request);
}
