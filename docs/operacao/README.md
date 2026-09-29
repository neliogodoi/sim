# Operação, validação e diagnóstico

[Índice geral](../../README.md)

## Desenvolvimento

1. Instale dependências com `npm ci` a partir do lockfile.
2. Crie `.env` a partir do exemplo se necessário e configure as integrações.
3. Confira o projeto Firebase dos dois arquivos de ambiente antes de ações com escrita; não há isolamento automático entre desenvolvimento e produção.
4. Execute `npm start` e abra `http://localhost:4200`.

O CLI instalado aceita Node `^20.19.0 || ^22.12.0 || >=24.0.0`; o gerenciador declarado é npm 10.9.2. Para configuração detalhada, veja [ambientes](../../src/environments/README.md).

## Build e publicação

`npm run build` gera o ambiente e executa o build de produção. A saída de navegador fica em `dist/sim/browser` no builder atual. O build usa substituição de ambiente, hashing de arquivos, otimização e service worker.

Budgets configurados: bundle inicial avisa em 800 kB e falha em 1 MB; CSS por componente avisa em 8 kB e falha em 10 kB. `qrcode` e `leaflet` estão explicitamente permitidos como dependências CommonJS.

`vercel.json` reescreve rotas para `/index.html`, permitindo entrada direta nos links da SPA. A configuração do projeto Vercel e o ambiente implantado não são comprovados por esse arquivo: confira comando de build, diretório de saída, variáveis e domínio no provedor.

`firebase.json` aponta para `firestore.rules`. Publicar frontend não publica regras. Uma publicação deliberada de regras, com Firebase CLI instalado e projeto conferido, usa `firebase deploy --only firestore:rules --project <projeto>`. Isso altera autorização remota: revise primeiro as [limitações atuais](../seguranca/README.md). Não há Hosting, Functions, emuladores ou configuração de índices declarados aqui.

## Validação disponível

Não existem arquivos de testes no projeto nem alvo `test` em `angular.json`, embora `package.json` tenha `npm test`. Não há lint/E2E configurados. Não relatar `npm test` como verificação funcional disponível.

Para mudanças no frontend, a compilação é uma verificação básica; não valida regras Firestore, funcionamento das APIs externas ou layout. Para documentação, confira links relativos, nomes, comandos e correspondência com o código.

## Roteiro manual em ambiente de teste

| Área | Verificação |
| --- | --- |
| Navegação | Entrada direta, reload de rota com slug, rotas admin e aliases de demo |
| Autenticação | Cadastro/login por senha, Google, cancelamento e retorno por redirect |
| Contexto | Seleção de dois casamentos sem mistura de dados; retorno após visitar demo |
| Cobrança | Estado inativo, ativo, expirado e erro; usar backend de teste para checkout |
| CRUD | Criar/editar/excluir entidade descartável, sem acessar dados reais |
| RSVP | Convite individual e aberto; três respostas e quantidade com acompanhantes |
| Recados | Envio, leitura pública, ocultação e exclusão |
| Imagens/mapa | Tipo/tamanho inválido, sucesso/erro de upload, coordenadas e links |
| Tema | Receita, fonte, persistência, contraste visual e layout móvel |
| Convites | Dados personalizados, QR code, imagens/fontes carregadas e `?print=1` |
| PWA | Instalação, atualização e shell; confirmar separadamente dependências de rede |
| Acesso | Anônimo, proprietário e usuário sem vínculo; testes de regras em ambiente isolado |

## Diagnóstico

| Sintoma | Onde investigar |
| --- | --- |
| Import de `environment.generated` ausente | Executar gerador ou usar scripts npm |
| Upload não configurado | Variáveis R2 no build; endpoint não está neste repo |
| Falha no upload | CORS, token, limite de 5 MiB, MIME, timeout e formato da resposta |
| Checkout não inicia | `ASAAS_API_URL`, `/checkout`, CORS e backend externo |
| Pagamento não libera painel | Documento `billing`, status, validade e sincronização externa |
| Lista vazia inesperada | Permissões, weddingId, rede; o serviço converte erros em lista vazia |
| Casamento incorreto no painel | `sim.activeWeddingId` e efeito da visita à demo |
| Google login falha | Provedor/domínio autorizado e suporte a popup/redirect |
| Impressão incompleta | Template SVG, caminhos de fontes, carregamento de imagens e estilos de impressão |
| Versão antiga da interface | Cache do navegador e ciclo de atualização do service worker |

Este roteiro é uma proposta de verificação; não é registro de testes executados nem comprovação da saúde dos serviços remotos.
