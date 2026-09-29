# Orientações para páginas

Leia o README de [admin](admin/README.md) ou [public](public/README.md), conforme a alteração.

- Mantenha a distinção entre rota pública com slug, painel com contexto local e demo com `default`.
- Ao acrescentar uma página, registre sua rota e imports e atualize os links de navegação. Um componente existente não implica rota ativa.
- Preserve `guestCount` como total de pessoas do convite, incluindo o titular; não some acompanhantes duas vezes.
- Preserve os links individuais e o parâmetro de impressão ao modificar convites.
- Use serviços para persistência e integrações; reutilize toasts e componentes compartilhados.
- Em novas ações, trate carregamento, erro e submissão repetida; bloqueie escrita no modo demo também no método da ação.
- Não considere o bloqueio premium do Router uma autorização de escrita. Não reproduza as lacunas atuais de configurações/tema na demo.
- Valide mudanças visuais em viewport móvel e desktop; para convites, confira impressão, fontes, SVG e QR code.
