# Visao geral

## Perfis de usuario

### Noivos

Usuarios administrativos do casamento. Podem editar as informacoes do evento, gerenciar convidados, acompanhar confirmacoes, configurar presentes, agenda, localizacao e visualizar mensagens recebidas.

### Convidados

Usuarios externos que acessam o convite por link. Podem visualizar informacoes publicas do casamento, confirmar presenca e enviar recados.

## Premissas tecnicas

- Frontend em Angular.
- Aplicacao instalavel como PWA.
- Firebase como unico backend.
- Firestore para dados estruturados.
- Firebase Authentication para acesso dos noivos.
- Firebase Storage apenas se houver upload de imagens.
- Deploy da aplicacao na Vercel.
- Cloud Functions nao deve ser usado no SIM.
- O MVP deve funcionar bem em celular, pois o principal canal de acesso sera por link compartilhado no WhatsApp.

## Conexao Firebase

O SIM deve usar o app web criado dentro do projeto Firebase `draw-holy`.

Configuracao do app web:

```ts
export const firebaseConfig = {
  apiKey: 'AIzaSyCoeZyCs-aM6EZtRbE_MU-ycr6_04Eybko',
  authDomain: 'draw-holy.firebaseapp.com',
  projectId: 'draw-holy',
  storageBucket: 'draw-holy.firebasestorage.app',
  messagingSenderId: '850533286648',
  appId: '1:850533286648:web:4fce1c0ff847436107710d',
  measurementId: 'G-K4B6NT8W3Z'
};
```

Servicos permitidos no frontend:

- Firebase App.
- Firebase Authentication.
- Cloud Firestore.
- Firebase Storage, somente se houver upload de imagens.
- Firebase Analytics, opcional.
- Vercel para deploy da PWA.

Servicos proibidos no MVP:

- Cloud Functions.
- Firebase Hosting.

Inicializacao esperada no Angular:

```ts
provideFirebaseApp(() => initializeApp(environment.firebase)),
provideAuth(() => getAuth()),
provideFirestore(() => getFirestore())
```

Nao adicionar:

```ts
provideFunctions(() => getFunctions())
```

## Modelo de dados inicial

### wedding

Representa o casamento configurado pelos noivos.

Campos sugeridos:

- `id`
- `coupleNames`
- `eventDate`
- `coverImageUrl`
- `welcomeMessage`
- `sharedAlbumUrl`
- `ceremonyAddress`
- `ceremonyMapUrl`
- `receptionAddress`
- `receptionMapUrl`
- `createdAt`
- `updatedAt`

### guest

Representa um convidado ou grupo convidado.

Campos sugeridos:

- `id`
- `weddingId`
- `name`
- `phone`
- `groupName`
- `guestCount`
- `rsvpStatus`
- `rsvpCompanions`
- `notes`
- `createdAt`
- `updatedAt`

Valores de `rsvpStatus`:

- `pending`
- `confirmed`
- `declined`
- `maybe`

### scheduleItem

Representa um item da agenda do casamento.

Campos sugeridos:

- `id`
- `weddingId`
- `title`
- `description`
- `startsAt`
- `locationLabel`
- `sortOrder`

### giftLink

Representa uma opcao de presente.

Campos sugeridos:

- `id`
- `weddingId`
- `title`
- `description`
- `url`
- `type`
- `sortOrder`

Valores sugeridos para `type`:

- `store`
- `pix`
- `quota`
- `other`

### message

Representa um recado enviado por convidado.

Campos sugeridos:

- `id`
- `weddingId`
- `guestName`
- `content`
- `isVisible`
- `createdAt`

## Regras de seguranca iniciais

- Apenas usuarios autenticados podem editar dados do casamento.
- Convidados podem criar confirmacoes e recados por rotas publicas controladas.
- A pagina publica deve ler apenas dados marcados como publicos.
- Regras do Firestore devem impedir edicao publica de dados administrativos.

## Rotas sugeridas

- `/` pagina publica do casamento.
- `/confirmar-presenca` formulario publico de confirmacao.
- `/presentes` lista publica de presentes.
- `/recados` mural publico de recados.
- `/album` tela publica com link e QR Code do album compartilhado.
- `/admin/login` login dos noivos.
- `/admin` resumo administrativo.
- `/admin/convidados` gerenciamento de convidados.
- `/admin/agenda` gerenciamento da agenda.
- `/admin/presentes` gerenciamento de presentes.
- `/admin/recados` gerenciamento de recados.
- `/admin/configuracoes` dados do casamento.

## Ordem sugerida de implementacao

Use o [checklist de implementacao](implementation-checklist.md) como fonte principal da ordem de trabalho e do status das funcionalidades.
