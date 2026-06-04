# Lista de convidados

## Objetivo

Permitir que os noivos cadastrem e acompanhem convidados do casamento.

## Usuario principal

Noivos.

## Comportamento esperado

- Cadastrar convidado com nome, telefone, grupo/familia e quantidade de pessoas.
- Editar dados do convidado.
- Remover convidado.
- Ver status de confirmacao.
- Filtrar por pendentes, confirmados, recusados e talvez.
- Exibir totais resumidos.

## Criterios de aceitacao

- Dado um novo convidado, quando os noivos salvarem o cadastro, entao ele deve aparecer na lista.
- Dado um convidado existente, quando o status de presenca mudar, entao o resumo deve refletir a nova contagem.
- Dado muitos convidados cadastrados, quando filtrar por `confirmed`, entao apenas confirmados devem ser exibidos.
- Dado um convidado removido, quando a lista for recarregada, entao ele nao deve aparecer.

## Fora do escopo inicial

- Importacao por planilha.
- Exportacao CSV.
- Controle de mesas.
