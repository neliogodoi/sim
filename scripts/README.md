# Scripts

[Índice geral](../README.md)

`generate-env.mjs` lê `.env` na raiz, combina com `process.env` e escreve `src/environments/environment.generated.ts`. Variáveis do processo prevalecem. As chaves reconhecidas são `R2_UPLOAD_URL`, `R2_UPLOAD_TOKEN` e `ASAAS_API_URL`; ausentes viram strings vazias.

```bash
node scripts/generate-env.mjs
```

Execute a partir da raiz. `npm start`, `npm run build` e `npm run watch` já chamam o gerador; `ng serve` ou `ng build` diretamente não fazem essa etapa. Em watch, mudanças no `.env` não regeneram automaticamente o arquivo: reinicie o comando ou execute o gerador.

O parser ignora linhas vazias/comentários, separa no primeiro `=` e remove aspas das extremidades. Não implementa interpolação de variáveis, valores multilinha nem toda a sintaxe de bibliotecas dotenv.

O arquivo gerado e `.env` são ignorados pelo Git. Não versionar valores reais. Consulte os [contratos de integração](../src/environments/README.md).
