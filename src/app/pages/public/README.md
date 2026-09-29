# Área pública

[Índice geral](../../../../README.md)

## Rotas ativas

As rotas abaixo estão em `app.routes.ts`. As versões sem slug usam o casamento `default`.

| Com slug | Sem slug | Página / finalidade |
| --- | --- | --- |
| — | `/` | `landing`: apresentação comercial e entrada/cadastro |
| `/:slug` | — | `home`: capa, nomes, mensagem, data e contagem regressiva |
| `/:slug/confirmar-presenca` | `/confirmar-presenca` | `rsvp`: confirmação sem convite prévio |
| `/:slug/convite/:guestId` | `/convite/:guestId` | `rsvp`: resposta de convidado existente |
| `/:slug/local` | `/local` | `location`: locais e links para mapas |
| `/:slug/presentes` | `/presentes` | `gifts`: links de presentes |
| `/:slug/mais` | `/mais` | `more`: atalhos para presentes e recados |
| `/:slug/recados` | `/recados` | `messages`: leitura e envio de mensagens |
| `/:slug/album` | `/album` | `album`: link externo e QR code do álbum |
| `/:slug/convite-padrinhos/:memberId` | `/convite-padrinhos/:memberId` | `groomsmen-invite`: convite de padrinhos |
| `/:slug/convite-especial/:personId` | `/convite-especial/:personId` | `important-person-invite`: convite especial |

Os componentes de `schedule`, `wedding-party` e `entrance-songs` existem, mas não têm rotas registradas atualmente. Não anuncie `/agenda`, `/padrinhos` ou `/musicas` como páginas públicas disponíveis. Um caminho de segmento único pode ser interpretado como slug; o wildcard redireciona os demais caminhos não encontrados para `/`.

## Confirmação de presença

Com `guestId`, a página busca o documento e preenche nome, telefone e quantidade. Sem ID, cria novo convidado. As respostas disponíveis são confirmado, recusado e talvez (`confirmed`, `declined`, `maybe`). O cadastro administrativo também admite pendente.

O payload inclui `guestCount` e `rsvpCompanions = max(0, guestCount - 1)`. O formulário sem convite não implementa deduplicação: envios separados podem criar registros diferentes. A resposta é persistida diretamente no Firestore e o estado local `saved` confirma a ação. Existe impressão via `window.print()`.

## Convites especiais e impressão

Padrinhos e pessoas importantes respondem `accepted` ou `declined`, com `respondedAt`. A apresentação usa os dados e o tema do casamento. O parâmetro `?print=1` inicia impressão após carregar o conteúdo e aguardar fontes/imagens.

O convite de padrinhos carrega `/template_convite.svg`, ajusta seu conteúdo no navegador, incorpora fontes e gera QR code para o link individual. O SVG resultante é marcado como HTML confiável pelo componente: alterações na origem do template e na inserção de conteúdo exigem revisão cuidadosa. Consulte [assets](../../../../public/README.md).

## Demais recursos

- Localização usa `locations` e mantém fallback para os campos antigos de cerimônia/recepção; links abrem Google Maps.
- Presentes são registros de links. A presença dos tipos `pix` e `quota` não implica processamento de transferências no app.
- Álbum é uma URL externa em `sharedAlbumUrl`, com QR code. Não existe galeria de fotos persistida como coleção própria.
- Recados listam apenas mensagens visíveis; novos envios já usam `isVisible: true`. A administração pode ocultar ou excluir depois.
- A landing tem menu e efeitos visuais próprios; não é o site do casal.

## Contexto e limites

`PublicNavComponent` conserva o slug nos links. As telas não devem usar a seleção administrativa para resolver um casamento público. `default` é apresentado como somente leitura em fluxos públicos, mas os limites efetivos dependem das regras Firestore e do usuário autenticado; veja [segurança](../../../../docs/seguranca/README.md).

Valide layout móvel, URLs diretas, estado sem dados, recados, RSVP e impressão ao alterar estas páginas. Não use casamentos reais para envios de teste.
