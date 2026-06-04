# Confirmacao de presenca

## Objetivo

Permitir que convidados informem se comparecerao ao casamento.

## Usuario principal

Convidado.

## Comportamento esperado

- O convidado informa nome e telefone.
- O convidado escolhe uma das opcoes: vou, nao vou ou talvez.
- O convidado informa quantidade de acompanhantes, quando permitido.
- O sistema salva a resposta no Firebase.
- O sistema mostra uma confirmacao visual apos o envio.

## Criterios de aceitacao

- Dado um convidado sem resposta, quando enviar confirmacao como "vou", entao o status deve ser salvo como `confirmed`.
- Dado um convidado que nao comparecera, quando enviar resposta como "nao vou", entao o status deve ser salvo como `declined`.
- Dado uma resposta enviada, quando o painel administrativo for aberto, entao a resposta deve aparecer na lista de convidados.
- Dado um formulario com nome vazio, quando tentar enviar, entao o sistema deve impedir o envio e indicar o campo obrigatorio.

## Fora do escopo inicial

- Validacao forte por token individual.
- Bloqueio de respostas duplicadas por dispositivo.
- Envio automatico de mensagens pelo WhatsApp.
