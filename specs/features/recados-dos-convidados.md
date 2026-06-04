# Recados dos convidados

## Objetivo

Permitir que convidados deixem mensagens simples para os noivos.

## Usuario principal

Convidado.

## Comportamento esperado

- Convidado informa nome e mensagem.
- Sistema salva o recado.
- Noivos visualizam recados no painel.
- Recados podem ser marcados como visiveis ou ocultos.

## Criterios de aceitacao

- Dado um recado valido, quando o convidado enviar, entao o recado deve ser salvo com data de criacao.
- Dado um recado enviado, quando os noivos abrirem o painel, entao o recado deve aparecer na lista.
- Dado um recado marcado como oculto, quando a pagina publica for carregada, entao ele nao deve aparecer publicamente.
- Dado uma mensagem vazia, quando tentar enviar, entao o sistema deve impedir o envio.

## Fora do escopo inicial

- Curtidas em mensagens.
- Respostas dos noivos.
- Moderacao automatica de conteudo.
