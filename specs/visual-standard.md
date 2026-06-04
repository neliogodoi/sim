# Padrao visual

Este documento define a direcao visual do SIM para manter consistencia entre a home publica, telas de convidados e painel administrativo.

## Principios

- O casal deve ser o foco visual da experiencia publica.
- A interface deve parecer afetiva, leve e elegante, sem perder clareza.
- O convidado deve entender rapidamente o que pode fazer.
- A personalizacao visual pertence aos noivos; convidados apenas visualizam a paleta aplicada.
- A aplicacao deve ser mobile-first, considerando acesso principalmente via WhatsApp.

## Estrutura visual da area publica

### Home

- Usar foto do casal como primeiro elemento visual.
- A imagem deve ocupar toda a largura da tela.
- Aplicar degradê suave para branco ou cor de fundo na transicao entre foto e conteudo.
- Exibir nomes dos noivos em destaque sobre ou logo abaixo da imagem.
- Exibir a data abaixo dos nomes.
- Exibir uma mensagem curta dos noivos com no maximo 4 linhas.
- Exibir uma acao principal clara para confirmacao de presenca.
- Usar menu fixo no rodape para navegacao principal.

### Telas secundarias

- Manter cabecalho simples com titulo da tela e contexto do casamento.
- Evitar blocos visuais pesados.
- Usar secoes limpas e bem espacadas.
- Priorizar leitura e acoes diretas.

## Navegacao publica

Usar menu fixo no rodape em telas publicas.

Itens recomendados:

- Inicio.
- Presenca.
- Local.
- Album.
- Mais.

O item Mais pode agrupar:

- Agenda.
- Presentes.
- Recados.

## Paleta de cores

### Uso

- A paleta ativa deve ser definida pelos noivos no painel administrativo.
- Convidados nao devem alterar a paleta publica.
- A home pode exibir um seletor de paleta apenas em modo administrativo ou modo edicao.
- A cor principal deve aparecer em botoes, links ativos, icones ativos e pequenos detalhes decorativos.
- A cor de fundo deve permanecer clara para preservar legibilidade.

### Tokens sugeridos

- `--color-primary`: cor principal da paleta.
- `--color-primary-contrast`: texto sobre a cor principal.
- `--color-background`: fundo principal.
- `--color-surface`: fundo de secoes e componentes.
- `--color-text`: texto principal.
- `--color-muted`: texto secundario.
- `--color-border`: bordas sutis.
- `--color-danger`: acoes destrutivas ou erros.
- `--color-success`: estados positivos.

### Paleta inicial sugerida

- Verde oliva como cor principal.
- Branco ou off-white como fundo.
- Verde escuro ou grafite quente como texto.
- Cinza suave para textos secundarios.
- Bege muito claro ou branco quente para superficies.

## Tipografia

### Area publica

- Usar fonte manuscrita apenas para nomes dos noivos e detalhes romanticos.
- Usar fonte legivel para textos, botoes, formularios e navegacao.
- Evitar paragrafo longo na home.
- Garantir que os nomes continuem legiveis em celulares pequenos.

### Painel administrativo

- Usar tipografia mais objetiva e funcional.
- Evitar fonte manuscrita em campos, tabelas e formularios.
- Priorizar leitura rapida e densidade moderada.

## Componentes visuais

### Botoes

- Botao principal usa `--color-primary`.
- Botao secundario usa fundo claro com borda sutil.
- Botoes devem ter texto curto e direto.
- A acao principal da home deve ser Confirmar presenca.

### Cards

- Usar cards apenas para itens repetidos ou blocos funcionais.
- Evitar cards dentro de cards.
- Bordas discretas e raio pequeno.
- Sombra leve ou nenhuma sombra.

### Formularios

- Campos grandes o suficiente para toque no celular.
- Labels sempre visiveis.
- Mensagens de erro curtas e proximas do campo.
- Estados de carregamento e sucesso devem ser claros.

### QR Code

- Exibir QR Code em fundo branco.
- Manter margem interna suficiente para leitura.
- Incluir botao alternativo para abrir o link diretamente.
- Usar o QR Code como complemento, nao como unica forma de acesso.

## Imagens

- A foto do casal deve ter prioridade visual na home.
- Usar `object-fit: cover` em areas de capa.
- Evitar cortes que removam rostos.
- Quando nao houver imagem, usar fundo claro com detalhe da paleta.
- Aplicar degradê apenas para melhorar transicao e leitura.

## Painel administrativo

- O painel deve ser mais funcional que romantico.
- Usar a mesma paleta para consistencia, mas com menos ornamentos.
- Exibir informacoes em secoes objetivas.
- Priorizar formularios, listas e indicadores de status.
- O seletor de paleta deve aparecer no painel ou em modo edicao da home.

## Estados obrigatorios

Cada tela deve prever:

- Carregando.
- Sem dados configurados.
- Erro ao carregar dados.
- Sucesso apos salvar ou enviar.
- Estado mobile sem sobreposicao de textos.

## Regras de consistencia

- Toda tela publica deve respeitar a paleta ativa.
- Toda acao principal deve ser visualmente mais forte que as demais.
- O menu do rodape deve manter a mesma ordem em todas as telas publicas.
- Textos decorativos nao devem substituir instrucoes importantes.
- Nenhuma tela publica deve quebrar quando dados opcionais estiverem ausentes.
