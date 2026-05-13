# Sistema do Fut - Vercel Blob

Esta versão usa a Vercel para hospedar o `index.html` e uma API serverless simples em `/api/state`.
Os dados ficam em um único arquivo JSON dentro do Vercel Blob: `fut-manager/state.json`.

## Por que Blob e não Edge Config?

- **Blob**: bom para guardar um arquivo JSON do estado do app e sobrescrever quando salvar.
- **Edge Config**: bom para dados lidos muitas vezes e alterados raramente, como feature flags e configurações.

Para este app, Blob é o mais simples.

## Passo a passo no Vercel

1. Crie/import seu projeto na Vercel usando estes arquivos.
2. Vá em **Storage**.
3. Clique em **Blob > Create**.
4. Recomendo escolher **Private**.
   - Mesmo os dados não sendo sensíveis, Private evita URL pública do JSON.
   - O app continua acessando tudo normalmente pela API `/api/state`.
5. Confirme que a Vercel criou a variável de ambiente `BLOB_READ_WRITE_TOKEN` no projeto.
6. Faça redeploy do projeto.
7. Teste:

```txt
https://SEU-PROJETO.vercel.app/api/health
```

Se responder `ok: true`, o Blob está conectado.

## Usar Blob público

Se você já criou o Blob como **Public**, adicione esta variável no projeto:

```txt
BLOB_ACCESS=public
```

Se criou como **Private**, não precisa adicionar nada. O padrão deste pacote é `private`.

## Como funciona

```txt
Celular abre o app
  -> GET /api/state
  -> API lê fut-manager/state.json no Vercel Blob
  -> app carrega jogadores, jogos, gols e avaliações

Ao salvar algo
  -> PUT /api/state
  -> API sobrescreve fut-manager/state.json no Vercel Blob
```

## Observação sobre vários celulares

Esta versão usa um único arquivo JSON. Para uma pessoa anotando os jogos, funciona bem.
Se duas pessoas salvarem ao mesmo tempo em celulares diferentes, a última gravação pode sobrescrever a anterior.
Para multiusuário pesado, o ideal seria um banco relacional, como Neon/Postgres, Supabase/Postgres ou MySQL externo.

## Rodar localmente

```bash
npm install
npx vercel env pull .env.local
npm run dev
```

