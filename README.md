# Sistema do Fut - Vercel Blob com pasta `/api`

Esta versão usa:

- `index.html` na raiz para a SPA.
- `api/state.js` para ler e salvar o estado no Vercel Blob.
- `api/health.js` para testar se o Blob está conectado.
- `package.json` com `@vercel/blob`.

## Estrutura

```txt
index.html
package.json
.gitignore
README.md
api/
  state.js
  health.js
```

## Como subir no GitHub

### Opção 1: upload pelo site

1. Crie um repositório vazio no GitHub.
2. Clique em **Add file > Upload files**.
3. Arraste os arquivos e a pasta `api` para a tela.
4. Clique em **Commit changes**.

### Opção 2: criar a pasta pelo site

Se o GitHub não aceitar arrastar pasta:

1. Envie primeiro `index.html`, `package.json`, `.gitignore` e `README.md`.
2. Clique em **Add file > Create new file**.
3. No nome do arquivo, digite exatamente:

```txt
api/state.js
```

4. Cole o conteúdo do arquivo `api/state.js` e salve.
5. Repita com:

```txt
api/health.js
```

## Como configurar na Vercel

1. Importe o repositório na Vercel.
2. Vá em **Storage**.
3. Crie/conecte um **Vercel Blob** ao projeto.
4. Para esta versão, o padrão é `public`, porque os dados são de brincadeira.
5. Confirme que a variável `BLOB_READ_WRITE_TOKEN` foi criada no projeto.
6. Faça redeploy.
7. Teste:

```txt
https://SEU-PROJETO.vercel.app/api/health
```

Se quiser usar Blob privado, adicione esta variável na Vercel:

```txt
FUT_BLOB_ACCESS=private
```

## Onde os dados ficam

Os dados ficam em um arquivo JSON no Blob:

```txt
fut-manager/state.json
```

Você pode mudar o caminho adicionando esta variável:

```txt
FUT_STATE_PATH=outro-caminho/state.json
```

## Observação

Esta solução salva tudo em um único JSON. Para uma pessoa anotando os jogos, é simples e suficiente. Se dois celulares salvarem exatamente ao mesmo tempo, a última gravação pode sobrescrever a anterior.
