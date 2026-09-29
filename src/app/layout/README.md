# Layout e navegação

[Índice geral](../../../README.md)

`PublicNavComponent` renderiza a navegação pública e constrói links com o `slug` da rota atual, usando `default` se ausente. O template usa `RouterLinkActive` para indicar o item atual.

`AdminHeaderComponent` constrói os links com `/demo` quando a URL está em demonstração ou no alias antigo; caso contrário usa `/admin`. As telas importam os componentes de layout conforme necessário, em vez de um layout de rotas filhas único.

Ao alterar menus, confira [app.routes.ts](../app.routes.ts): páginas sem rota não devem ganhar links quebrados. Preserve indicação de foco/seleção, labels dos ícones, espaço para navegação fixa e funcionamento em telas pequenas. As cores vêm dos tokens globais do tema.
