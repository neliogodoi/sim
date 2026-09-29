# Assets públicos

[Índice geral](../README.md)

O Angular copia o conteúdo desta pasta para a raiz pública do build. Arquivos aqui são públicos, incluindo este README; não armazene segredos ou dados privados.

| Conteúdo | Uso |
| --- | --- |
| `sim-logo.png`, `favicon.png` | Identidade visual |
| `foto-casal.png`, `fot0-padrinhos.jpg` | Imagens disponíveis para apresentação |
| `mockup-app.png`, `mockup-convites.png`, `mockup-convite-impresso.png` | Material visual do produto |
| `template_convite.svg` | Template carregado dinamicamente pelo convite de padrinhos |
| `blue_theme_invite_template.svg`, `green_theme_invite_template.svg` | Outros templates disponíveis; sua existência não significa seleção ativa na UI |
| `fonts/` | Fontes locais usadas pelo visual e pela composição de convites |
| `manifest.webmanifest` | Metadados para instalação PWA |

O catálogo de fontes está em `src/app/core/constants/script-fonts.ts`. Há também fontes de apoio em `fonts/`. Preserve nomes e caminhos, inclusive espaços e capitalização: o convite pode carregar os bytes para incorporar a fonte ao SVG.

Ao editar `template_convite.svg`, confira os seletores e transformações de `groomsmen-invite.page.ts`. O componente modifica o SVG, aplica nomes/cores/fonte, insere QR code e aguarda assets para imprimir. Uma mudança de estrutura pode quebrar o resultado sem erro de compilação.

O cache é configurado em `ngsw-config.json`, com prefetch do shell e carregamento lazy de imagens/fontes. A lista do shell e o manifesto referenciam `favicon.ico`, enquanto o arquivo disponível é `favicon.png`; revise essas referências ao alterar ícones. Não confunda cache de assets com persistência offline dos dados do casamento.
