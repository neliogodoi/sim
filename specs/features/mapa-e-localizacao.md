# Mapa e localizacao

## Objetivo

Facilitar que convidados encontrem o local da cerimonia e da recepcao.

## Usuario principal

Convidado.

## Comportamento esperado

- Exibir endereco da cerimonia.
- Exibir endereco da recepcao, quando houver.
- Oferecer link para abrir rota no Google Maps.
- Permitir que cerimonia e recepcao usem o mesmo endereco.

## Criterios de aceitacao

- Dado um endereco configurado, quando o convidado tocar no botao de mapa, entao deve abrir o link externo de localizacao.
- Dado que a recepcao nao tenha endereco proprio, quando a pagina carregar, entao nao deve exibir uma secao vazia.
- Dado um link de mapa invalido ou ausente, quando a pagina carregar, entao deve exibir o endereco em texto.

## Fora do escopo inicial

- Mapa embutido interativo.
- Calculo de rota dentro da aplicacao.
