# Painel administrativo

## Objetivo

Permitir que os noivos configurem e acompanhem o casamento em uma area privada.

## Usuario principal

Noivos.

## Comportamento esperado

- Login dos noivos via Firebase Authentication.
- Edicao dos dados principais do casamento.
- Configuracao da paleta visual do casamento.
- Gerenciamento de convidados.
- Visualizacao de resumo de presencas.
- Gerenciamento de agenda, presentes, recados e link do album compartilhado.
- Acesso rapido ao link publico do convite.

## Criterios de aceitacao

- Dado um usuario autenticado, quando acessar o painel, entao deve ver os dados do casamento.
- Dado um usuario nao autenticado, quando tentar acessar o painel, entao deve ser redirecionado para login.
- Dado alteracoes nos dados do casamento, quando salvar, entao a pagina publica deve refletir os dados atualizados.
- Dado confirmacoes recebidas, quando o painel carregar, entao deve exibir totais de convidados por status.
- Dado um link de album compartilhado configurado, quando salvar, entao a tela publica do album deve exibir botao e QR Code para esse link.

## Fora do escopo inicial

- Multiplos casamentos por usuario.
- Permissoes avancadas por papel.
- Auditoria de alteracoes.
