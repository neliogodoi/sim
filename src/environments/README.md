# Ambiente e integrações

[Índice geral](../../README.md)

## Configuração

`environment.ts` define desenvolvimento e `environment.production.ts` define produção. O build de produção substitui o primeiro pelo segundo. Ambos importam `environment.generated.ts` e contêm configuração cliente do Firebase. Atualmente apontam ao mesmo projeto remoto; não há emulador configurado.

Os providers registrados são Authentication e Firestore. Não há provider de Firebase Storage na configuração atual: imagens são enviadas pelo serviço de R2.

| Variável | Destino gerado | Uso |
| --- | --- | --- |
| `R2_UPLOAD_URL` | `r2Upload.url` | URL completa do endpoint de upload |
| `R2_UPLOAD_TOKEN` | `r2Upload.token` | Header `x-upload-token` |
| `ASAAS_API_URL` | `asaas.apiUrl` | URL base da API de cobrança |

O `.env.example` atual lista apenas as duas variáveis de R2. Para cobrança, acrescente `ASAAS_API_URL` no ambiente local ou no provedor de build. Não coloque a chave privada do Asaas aqui. O token de upload também será incluído no JavaScript distribuído e não pode ser tratado como segredo inacessível ao público.

O [gerador](../../scripts/README.md) dá precedência às variáveis do processo sobre `.env`. Mudanças exigem nova geração/rebuild, inclusive em deploy: não são configurações lidas em runtime do servidor.

## Firebase

Login/cadastro dependem dos provedores de autenticação e domínios autorizados no projeto Firebase. Google tenta popup e usa redirect em erros específicos de bloqueio/ambiente incompatível; fechamento do popup não conclui login.

Os documentos e regras estão descritos no [núcleo](../app/core/README.md) e no [guia de acesso](../../docs/seguranca/README.md). Configurar o frontend não publica regras nem cria um casamento `default`. Não existe seed automatizado neste repositório.

## Contrato R2 esperado pelo cliente

`R2UploadService.uploadImage(file)` exige URL/token não vazios, MIME começando por `image/` e tamanho de até 5 MiB. O timeout é de 30 segundos.

```http
POST <R2_UPLOAD_URL>
content-type: <MIME do arquivo>
x-upload-token: <token configurado>

<bytes do arquivo; não é multipart/form-data>
```

Resposta de sucesso: JSON `{ "url": "https://..." }` ou texto começando por `http`. A requisição deve retornar status HTTP de sucesso e uma URL. Erros JSON podem fornecer `error`.

O endpoint/Worker, bucket, autorização e CORS são externos. Para chamadas entre origens, o servidor precisa aceitar os headers usados pelo cliente. A validação de tamanho/tipo no navegador não substitui validação no servidor.

## Contrato Asaas esperado pelo cliente

O serviço remove barras finais da URL base e falha se ela estiver vazia.

```http
POST <ASAAS_API_URL>/checkout
Content-Type: application/json
```

```json
{
  "weddingId": "slug-ou-id",
  "coupleNames": "Nomes do casal",
  "successUrl": "<origem>/admin/pagamento?status=success",
  "cancelUrl": "<origem>/admin/pagamento?status=cancel"
}
```

Resposta tipada: `{ checkoutUrl: string, billing?: WeddingBilling }`. O cliente redireciona para `checkoutUrl`.

```http
POST <ASAAS_API_URL>/sync
Content-Type: application/json
```

Corpo: `{ "weddingId": "slug-ou-id" }`. Resposta tipada: `{ billing?: WeddingBilling }`. A interface espera observar a atualização da cobrança via Firestore; não grava esse retorno.

As chamadas atuais não acrescentam token Firebase nem há interceptor configurado para isso. Não é possível confirmar autenticação, propriedade, valores cobrados ou validação de webhook sem o backend externo. Os contratos acima descrevem o que o frontend envia, não uma API completa implementada aqui.

## Outras dependências externas

Leaflet usa tiles do OpenStreetMap; links de localização abrem Google Maps. O utilitário de imagem adapta URLs do Google Drive. WhatsApp, clipboard, compartilhamento nativo e impressão são acionados pelo navegador. Não há API própria para enviar mensagens ou gerenciar fotos do álbum externo.
