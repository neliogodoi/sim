# Núcleo, serviços e modelo de dados

[Índice geral](../../../README.md)

## Serviços

| Serviço | Responsabilidade e comportamento |
| --- | --- |
| `AuthService` | Login por senha, cadastro, Google por popup com fallback para redirect, conclusão do redirect e logout; expõe `user$` |
| `AdminWeddingBootstrapService` | Localiza casamento do usuário, seleciona o ativo ou o primeiro; cria um se não houver |
| `WeddingContextService` | ID público por rota e ID administrativo persistido localmente |
| `WeddingService` | Leitura/escrita Firestore de todas as entidades e índice de casamentos por usuário |
| `BillingService` | Verifica premium e chama `/checkout` e `/sync` da API externa |
| `R2UploadService` | Envia imagem binária a endpoint externo e retorna URL |
| `ThemeGeneratorService` | Gera paleta a partir da cor principal e receita visual, sem IA ou API externa |
| `ThemeService` | Converte tema persistido em variáveis CSS e aplica fonte |

## Autenticação e seleção

Após login/cadastro, o bootstrap consulta a propriedade do ID preferido e o índice `userWeddings`. Confirma a existência do documento `owners/{uid}` antes de aceitar cada casamento. Se necessário, cria um ID com nome normalizado e oito caracteres de UUID, grava o casamento, o proprietário e o índice.

`createWedding` assume `status: published` quando ausente. Essas gravações são sequenciais, sem transação: uma falha pode deixar registros parciais. O cadastro automático usa nome de exibição ou `Novo casamento`, com data vazia.

| Guard | Comportamento |
| --- | --- |
| `adminGuard` | Exige autenticação; redireciona ao login |
| `loginGuard` | Usuário autenticado vai para `/admin` |
| `premiumGuard` | Lê casamento ativo e exige cobrança ativa e não expirada |
| `demoAdminGuard` | Seleciona `default` e libera a rota sem autenticação |

Premium é verdadeiro com `billing.status === 'active'` e `premiumUntil` ausente ou uma data válida futura. Os guards não fazem validação de proprietário nem substituem regras de acesso.

## Estrutura Firestore

```text
weddings/{weddingId}
  owners/{uid}
  guests/{guestId}
  scheduleItems/{itemId}
  giftLinks/{giftId}
  weddingParty/{memberId}
  importantPeople/{personId}
  entranceSongs/{songId}
  vendors/{vendorId}
  messages/{messageId}
userWeddings/{uid}/weddings/{weddingId}
```

As interfaces completas estão em [wedding.models.ts](models/wedding.models.ts). IDs retornados nas leituras reativas usam `idField: 'id'`. Timestamps de aplicação são strings ISO geradas pelo cliente, não `serverTimestamp`.

| Modelo | Campos e semântica principais |
| --- | --- |
| `Wedding` | `id`, `slug`, `status`, `coupleNames`, `eventDate`, capa, mensagem, URL de álbum, locais, tema e cobrança |
| `WeddingLocation` | `id`, `label`, endereço, latitude/longitude, URL de mapa e `sortOrder`; fica no array `locations` |
| `Guest` | Nome, telefone, grupo, `guestCount`, resposta, acompanhantes e notas; `guestCount` inclui titular |
| `ScheduleItem` | Título, data opcional, `startsAt`, descrição, local e ordem |
| `GiftLink` | Título, URL, descrição, ordem e tipo `store`, `pix`, `quota` ou `other` |
| `WeddingPartyMember` | Um ou dois nomes, lado `bride`, `groom` ou `couple`, foto, ordem e resposta |
| `ImportantPerson` | Nome, segundo nome, papéis, foto, descrição, ordem e resposta |
| `EntranceSong` | Momento, título da música, URL e ordem |
| `Vendor` | Nome, categoria, contato, telefone, URL, notas e ordem |
| `GuestMessage` | Nome do convidado, conteúdo, visibilidade e data de criação |
| `WeddingBilling` | Provedor `asaas`, status, IDs externos, checkout, validade e datas de sincronização |
| `WeddingTheme` | Cor principal, derivados, contraste, fundo, superfície, texto, borda, receita e fonte |

Respostas de convidados: `pending`, `confirmed`, `declined`, `maybe`. Convites de padrinhos/pessoas: `accepted` ou `declined`; ausência representa convite ainda sem resposta. Cobrança: `inactive`, `pending`, `active`, `overdue`, `canceled`.

Papéis de pessoas: `parent`, `groomFather`, `groomMother`, `brideFather`, `brideMother`, `page`, `maid`, `family`, `other`. Categorias de fornecedores: `buffet`, `photography`, `venue`, `store`, `decor`, `music`, `other`.

`owners/{uid}` contém `uid`, `weddingId` e datas; o índice do usuário contém `weddingId` e datas. Não há modelo separado de casal/organização nem papéis administrativos graduais.

## Persistência e consultas

- A maioria dos métodos aceita `weddingId` com fallback `default`.
- `saveWedding` faz `setDoc` com merge e atualiza `slug` e `updatedAt`.
- Métodos de entidades com ID atualizam; sem ID adicionam documento. `cleanData` remove `undefined` apenas do primeiro nível em adições/atualizações.
- A agenda ordena por data e hora quando válidas, com fallback para `sortOrder`. Presentes, padrinhos, músicas, pessoas e fornecedores ordenam por `sortOrder` no cliente.
- Recados públicos filtram `isVisible == true`; a página pública cria recados já visíveis.
- Não há paginação nas leituras de coleções nem exclusão em cascata implementada no serviço.
- `doc$` retorna `undefined` e `col$` retorna `[]` em erro. Consultas de índice/propriedade também têm fallbacks; falha de acesso pode parecer ausência de dados.

## Temas e utilitários

Receitas atuais: `elegant`, `romantic`, `editorial`, `ceremonial`, `modern`, `bold`. O gerador normaliza hexadecimal, ajusta saturação/luminosidade e combina acento e neutros. Há conversão dos valores antigos de `contrastRule` para receitas.

A tela de tema persiste `presetId: generated`, derivados, aliases legados (`secondary`, `tertiary`, `neutral`) e fonte normalizada. `theme-presets.ts` continua usado na criação pelo dashboard; fontes e caminhos de assets ficam em `script-fonts.ts`.

`toDisplayImageUrl` converte links reconhecidos do Google Drive em thumbnail; demais URLs são preservadas. Não é um validador de segurança de URLs.

As regras e problemas de autorização estão em [acesso e limitações](../../../docs/seguranca/README.md). Os contratos HTTP estão em [integrações](../../environments/README.md).
