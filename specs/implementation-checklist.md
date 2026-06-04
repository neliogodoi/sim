# Checklist de implementacao

Este documento deve ser atualizado pelos agents conforme as funcionalidades forem implementadas. Marque um item apenas quando a funcionalidade estiver integrada, navegavel e persistindo dados conforme a spec correspondente.

## Ordem por dependencias

1. Base da aplicacao e infraestrutura.
2. Autenticacao e painel administrativo.
3. Configuracao do casamento.
4. Pagina publica do casal.
5. Funcionalidades publicas dependentes dos dados do casamento.
6. Funcionalidades administrativas de acompanhamento.

## Checklist geral

- [x] Base Angular PWA criada.
- [x] Rotas principais configuradas.
- [x] Firebase configurado no projeto.
- [x] Credenciais do app web `draw-holy` configuradas no environment.
- [x] Firestore configurado.
- [x] Firebase Authentication configurado.
- [x] Cloud Functions ausente da configuracao Angular.
- [x] `firebase.json` sem bloco `functions`.
- [x] `firebase.json` sem bloco de Hosting.
- [x] `vercel.json` com rewrite para SPA criado.
- [x] Projeto Firebase `draw-holy` configurado em `.firebaserc`.
- [x] Regras iniciais de seguranca do Firestore criadas.
- [x] Layout responsivo base criado.
- [x] Tokens de tema do padrao visual criados.
- [x] Menu publico fixo no rodape criado.

## Funcionalidades

### 1. Painel administrativo

Spec: [Painel administrativo](features/painel-administrativo.md)

Dependencias:

- Base Angular PWA.
- Firebase Authentication.
- Firestore.

Checklist:

- [x] Tela de login dos noivos criada.
- [x] Protecao de rotas administrativas criada.
- [x] Tela de resumo administrativo criada.
- [x] Edicao dos dados principais do casamento criada.
- [x] Campo para link do album compartilhado criado.
- [x] Seletor de paleta visual criado.
- [ ] Atalho para link publico do convite criado.

### 2. Pagina do casal

Spec: [Pagina do casal](features/pagina-do-casal.md)

Dependencias:

- Firestore.
- Dados principais do casamento configuraveis no painel.

Checklist:

- [x] Tela publica inicial criada.
- [x] Nomes dos noivos exibidos.
- [x] Data do casamento exibida.
- [x] Mensagem dos noivos exibida.
- [x] Imagem de capa ou estado visual padrao exibido.
- [x] Degradê entre foto e conteudo criado.
- [x] Botao principal de confirmar presenca criado.
- [x] Atalhos publicos para RSVP, localizacao, agenda, presentes, recados e album exibidos.

### 3. Lista de convidados

Spec: [Lista de convidados](features/lista-de-convidados.md)

Dependencias:

- Painel administrativo.
- Firestore.

Checklist:

- [x] Cadastro de convidado criado.
- [x] Edicao de convidado criada.
- [x] Remocao de convidado criada.
- [ ] Filtros por status criados.
- [ ] Totais resumidos por status criados.

### 4. Confirmacao de presenca

Spec: [Confirmacao de presenca](features/confirmacao-de-presenca.md)

Dependencias:

- Lista de convidados.
- Pagina publica do casal.
- Firestore.

Checklist:

- [x] Tela publica de confirmacao criada.
- [x] Formulario com nome e telefone criado.
- [x] Opcoes vou, nao vou e talvez criadas.
- [x] Quantidade de acompanhantes criada.
- [x] Persistencia do status no convidado criada.
- [x] Estado de sucesso apos envio criado.

### 5. Convite digital

Spec: [Convite digital](features/convite-digital.md)

Dependencias:

- Pagina publica do casal.
- Confirmacao de presenca.

Checklist:

- [ ] Link publico do casamento definido.
- [ ] Acao para copiar link criada.
- [ ] Compartilhamento por WhatsApp criado.
- [ ] Botao para confirmar presenca no convite criado.

### 6. Contagem regressiva

Spec: [Contagem regressiva](features/contagem-regressiva.md)

Dependencias:

- Data do casamento configurada.
- Pagina publica do casal.

Checklist:

- [x] Calculo de dias restantes criado.
- [x] Exibicao na pagina publica criada.
- [ ] Exibicao no painel criada.
- [ ] Estado para dia do casamento criado.
- [ ] Estado para data passada criado.

### 7. Agenda do evento

Spec: [Agenda do evento](features/agenda-do-evento.md)

Dependencias:

- Painel administrativo.
- Pagina publica do casal.
- Firestore.

Checklist:

- [x] Cadastro de item de agenda criado.
- [x] Edicao de item de agenda criada.
- [x] Remocao de item de agenda criada.
- [x] Listagem publica em ordem cronologica criada.
- [x] Estado sem agenda criada.

### 8. Mapa e localizacao

Spec: [Mapa e localizacao](features/mapa-e-localizacao.md)

Dependencias:

- Dados principais do casamento configuraveis no painel.
- Pagina publica do casal.

Checklist:

- [x] Campos de endereco da cerimonia criados.
- [x] Campos de endereco da recepcao criados.
- [x] Campos de links do Google Maps criados.
- [x] Tela publica de localizacao criada.
- [x] Abertura de rota externa criada.
- [x] Estado para endereco ausente criado.

### 9. Lista de presentes

Spec: [Lista de presentes](features/lista-de-presentes.md)

Dependencias:

- Painel administrativo.
- Pagina publica do casal.
- Firestore.

Checklist:

- [x] Cadastro de link de presente criado.
- [x] Edicao de link de presente criada.
- [x] Remocao de link de presente criada.
- [x] Ordenacao de opcoes criada.
- [x] Listagem publica de presentes criada.
- [x] Abertura externa dos links criada.

### 10. Recados dos convidados

Spec: [Recados dos convidados](features/recados-dos-convidados.md)

Dependencias:

- Pagina publica do casal.
- Painel administrativo.
- Firestore.

Checklist:

- [x] Formulario publico de recado criado.
- [x] Persistencia de recado criada.
- [x] Listagem administrativa de recados criada.
- [x] Controle de visibilidade criado.
- [x] Mural publico de recados visiveis criado.

### 11. Album compartilhado

Spec: [Album compartilhado](features/album-compartilhado.md)

Dependencias:

- Campo `sharedAlbumUrl` configuravel no painel.
- Pagina publica do casal.

Checklist:

- [x] Campo `sharedAlbumUrl` salvo no casamento.
- [x] Tela publica `/album` criada.
- [x] Botao para abrir Google Fotos criado.
- [x] QR Code gerado a partir do link criado.
- [x] Estado sem link configurado criado.

## Validacao final do MVP

- [ ] Fluxo dos noivos completo: login, configuracao e acompanhamento.
- [ ] Fluxo do convidado completo: abrir convite, confirmar presenca, consultar informacoes e acessar album.
- [ ] Dados persistidos no Firebase.
- [ ] App usavel em celular.
- [ ] Nenhuma rota publica exibe estado quebrado quando dados opcionais estao ausentes.
