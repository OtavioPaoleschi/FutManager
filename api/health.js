import { list } from '@vercel/blob';

const STATE_PATH = process.env.FUT_STATE_PATH || 'fut-manager/state.json';
const BLOB_ACCESS = process.env.FUT_BLOB_ACCESS || process.env.BLOB_ACCESS || 'private';

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return json({
        ok: false,
        blob: false,
        error: 'BLOB_READ_WRITE_TOKEN não configurado.',
      }, 500);
    }

    await list({ limit: 1 });

    return json({
      ok: true,
      blob: true,
      storage: 'vercel-blob',
      access: BLOB_ACCESS,
      statePath: STATE_PATH,
    });
  } catch (error) {
    console.error(error);
    return json({
      ok: false,
      blob: false,
      storage: 'vercel-blob',
      error: error?.message || 'Erro interno.',
    }, 500);
    
  }
}
