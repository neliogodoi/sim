# Album compartilhado

## Objetivo

Permitir que convidados acessem um album compartilhado externo no Google Fotos para visualizar e adicionar fotos do casamento.

## Usuario principal

Convidado.

## Comportamento esperado

- Exibir uma tela publica dedicada ao album compartilhado.
- Exibir um botao principal para abrir o album no Google Fotos.
- Exibir um QR Code apontando para o mesmo link do album.
- Permitir que os noivos configurem o link do album no painel administrativo.
- Ocultar a tela ou mostrar estado vazio quando o link do album ainda nao estiver configurado.
- Deixar claro que as fotos sao adicionadas e gerenciadas no Google Fotos, fora do SIM.

## Criterios de aceitacao

- Dado um link de album configurado, quando o convidado abrir `/album`, entao deve ver o botao para abrir o album e o QR Code correspondente.
- Dado que o convidado toque no botao do album, quando estiver em celular, entao deve ser direcionado para o Google Fotos em uma nova aba ou aplicativo compativel.
- Dado que outro convidado escaneie o QR Code, quando abrir o link, entao deve acessar o mesmo album compartilhado.
- Dado que o link do album nao esteja configurado, quando a tela carregar, entao nao deve exibir QR Code quebrado nem botao sem destino.
- Dado que os noivos atualizem o link do album no painel, quando a tela publica for recarregada, entao o botao e o QR Code devem usar o novo link.

## Dados necessarios

- `sharedAlbumUrl` no documento `wedding`.

## Regras e restricoes

- O SIM nao deve tentar listar fotos do Google Fotos dentro da aplicacao no MVP.
- O SIM nao deve depender da API do Google Photos para ler album compartilhado.
- O QR Code deve ser gerado a partir do link configurado pelos noivos.
- O link deve ser validado como URL antes de ser salvo.

## Fora do escopo inicial

- Exibir miniaturas das fotos dentro do SIM.
- Sincronizar fotos do Google Fotos com Firebase Storage.
- Fazer upload de fotos pelo SIM.
- Moderar fotos adicionadas ao album.
- Identificar qual convidado adicionou cada foto.
