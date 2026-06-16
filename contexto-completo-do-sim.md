# SIM - Contexto completo do produto

Este documento serve como fonte unica de entendimento para outra IA sobre o que e o SIM, como a aplicacao esta organizada, quais telas existem, como o usuario navega, quais dados existem e qual e a direcao visual do sistema.

## 1. O que e o SIM

SIM e uma PWA em Angular para gerenciamento de casamento. A ideia central e oferecer um espaco digital para os noivos apresentarem o evento, compartilharem o convite e centralizarem informacoes essenciais para convidados, padrinhos e pessoas importantes.

O sistema combina:

- Area publica para convidados.
- Area administrativa para os noivos.
- Persistencia em Firebase.
- Experiencia mobile-first, pensada para acesso por link compartilhado, principalmente via WhatsApp.

O nome SIM significa "Seu Incrivel Momento".

## 2. Objetivo do produto

O objetivo principal e permitir que um casal:

- Crie uma pagina publica do casamento.
- Compartilhe um convite digital unico.
- Receba confirmacao de presenca.
- Organize convidados, agenda, presentes, recados, padrinhos, pessoas importantes, musicas de entrada e fornecedores.
- Mantenha um painel administrativo com as informacoes do evento.

## 3. Perfis de usuario

### 3.1 Noivos

Usuarios administrativos do casamento.

Podem:

- Fazer login e acessar o painel.
- Criar ou editar os dados do casamento.
- Definir paleta visual e fonte script.
- Gerenciar convidados.
- Gerenciar agenda.
- Gerenciar presentes.
- Gerenciar recados.
- Gerenciar album compartilhado.
- Gerenciar padrinhos, pessoas importantes, musicas de entrada e fornecedores.
- Acompanhar respostas de presenca.

### 3.2 Convidados

Usuarios publicos que acessam por link.

Podem:

- Ver a pagina do casal.
- Ver localizacao, agenda, presentes, album e mais informacoes.
- Confirmar presenca.
- Enviar recados.
- Abrir links externos, como maps, album e presentes.

## 4. Stack e arquitetura

### Frontend

- Angular.
- Rotas carregadas de forma lazy em varias paginas.
- Componentes standalone.
- PWA com service worker.

### Backend

- Firebase App.
- Firebase Authentication.
- Cloud Firestore.
- Firebase Storage apenas quando necessario para imagens.

### Deploy

- Vercel.

### Restricoes do MVP

- Nao usar Cloud Functions.
- Nao usar Firebase Hosting.
- Nao depender de processamento backend customizado.

## 5. Estrutura geral da navegacao

O sistema esta dividido em dois grandes blocos:

### 5.1 Area publica

Rotas para convidados e visitantes.

### 5.2 Area administrativa

Rotas protegidas por guard e login.

## 6. Rotas publicas

As rotas publicas usam dois formatos:

- Rotas globais sem slug.
- Rotas com `:slug`, que representam um casamento especifico.

### Rotas sem slug

- `/` abre a landing page institucional do SIM.
- `/confirmar-presenca`
- `/convite/:guestId`
- `/local`
- `/presentes`
- `/mais`
- `/recados`
- `/album`
- `/convite-padrinhos/:memberId`
- `/convite-especial/:personId`

### Rotas com slug

- `/:slug`
- `/:slug/confirmar-presenca`
- `/:slug/convite/:guestId`
- `/:slug/local`
- `/:slug/presentes`
- `/:slug/mais`
- `/:slug/recados`
- `/:slug/album`
- `/:slug/convite-padrinhos/:memberId`
- `/:slug/convite-especial/:personId`

### Interpretacao do slug

- Se a rota e administrativa, o sistema usa o casamento ativo salvo localmente.
- Se a rota e publica e tem slug, esse slug identifica o casamento.
- Se nao houver slug, o sistema usa o casamento padrao `default`.

## 7. Rotas administrativas

As rotas administrativas sao protegidas por guards.

- `/admin/login`
- `/admin/cadastro`
- `/admin`
- `/admin/convidados`
- `/admin/agenda`
- `/admin/presentes`
- `/admin/padrinhos`
- `/admin/pessoas`
- `/admin/musicas`
- `/admin/fornecedores`
- `/admin/recados`
- `/admin/mais`
- `/admin/configuracoes`

## 8. Fluxo de entrada

### 8.1 Landing institucional

A rota `/` mostra uma landing page de marketing do SIM.

Elementos principais:

- Header fixo com logo.
- Link para entrar.
- Link para criar conta.
- Hero com mensagem de posicionamento.
- Blocos explicando experiencia, recursos e chamada para WhatsApp.

Essa pagina nao e o convite do casamento. E a pagina comercial do produto SIM.

### 8.2 Pagina publica do casamento

A rota `/:slug` e a pagina principal do casal.

Ela concentra:

- Nome dos noivos.
- Foto de capa, se existir.
- Data do casamento.
- Mensagem curta.
- Estado visual elegante e romantico.
- Navegacao publica fixa no rodape.

## 9. Area publica em detalhe

### 9.1 Pagina do casal

E a tela central da experiencia publica.

Comportamento esperado:

- Mostrar a foto principal do casal ou um placeholder elegante.
- Aplicar degradê suave da imagem para o fundo.
- Destacar os nomes com fonte script.
- Mostrar a data com tipografia de apoio.
- Exibir uma mensagem curta dos noivos.
- Exibir a contagem regressiva, quando houver data valida.
- Levar o convidado para as demais telas com a navegacao inferior.

### 9.2 Confirmacao de presenca

Rota:

- `/confirmar-presenca`
- `/:slug/confirmar-presenca`
- `/convite/:guestId`
- `/:slug/convite/:guestId`

Fluxo:

- O convidado informa nome e telefone.
- Escolhe um status de presenca.
- Pode informar acompanhantes, se permitido pelo formulario.
- A resposta e salva no Firestore.
- O sistema mostra confirmacao visual depois do envio.

Status usados:

- `pending`
- `confirmed`
- `declined`
- `maybe`

### 9.3 Localizacao

Rota:

- `/local`
- `/:slug/local`

Fluxo:

- Exibe o endereco da cerimonia.
- Exibe o endereco da recepcao quando existir.
- Abre link externo para mapa, se configurado.
- Se nao houver URL de mapa, ainda mostra o endereco em texto.

### 9.4 Lista de presentes

Rota:

- `/presentes`
- `/:slug/presentes`

Fluxo:

- Mostra opcoes de presente cadastradas pelos noivos.
- Cada item pode apontar para loja, Pix, cota simbolica ou outro link.
- Links externos abrem fora da aplicacao.
- A lista pode ficar oculta se nao houver itens.

### 9.5 Mais

Rota:

- `/mais`
- `/:slug/mais`

Fluxo:

- Funciona como hub de informacoes secundarias.
- Agrupa itens como agenda, presentes e recados.
- Serve como atalho para o restante das informacoes que nao cabem no menu principal.

### 9.6 Recados

Rota:

- `/recados`
- `/:slug/recados`

Fluxo:

- O convidado envia nome e mensagem.
- O recado e salvo no Firestore.
- O painel administrativo pode aprovar, ocultar ou listar recados.
- Na area publica, apenas recados visiveis aparecem.

### 9.7 Album compartilhado

Rota:

- `/album`
- `/:slug/album`

Fluxo:

- Exibe um botao para abrir o album externo.
- Exibe um QR Code gerado a partir do link salvo.
- Se nao houver link configurado, a tela nao deve mostrar QR quebrado nem CTA sem destino.
- O album e externo ao SIM; a plataforma nao hospeda as fotos no MVP.

### 9.8 Convites especiais

Rotas:

- `/convite-padrinhos/:memberId`
- `/:slug/convite-padrinhos/:memberId`
- `/convite-especial/:personId`
- `/:slug/convite-especial/:personId`

Fluxo:

- Servem para convites direcionados a padrinhos ou pessoas importantes.
- A tela e mais emocional e personalizada.
- Pode ter imagem de capa, texto de convite e controles de aceitacao.

## 10. Navegacao publica

O rodape publico e fixo e mostra 4 entradas principais:

- Inicio.
- Local.
- Album.
- Mais.

Caracteristicas:

- Sempre visivel nas telas publicas principais.
- Usa icones lineares.
- Destaca o item ativo.
- Mantem a navegacao acessivel no celular.

## 11. Area administrativa em detalhe

### 11.1 Login e cadastro

Rotas:

- `/admin/login`
- `/admin/cadastro`

Fluxo:

- Usuario acessa login.
- O sistema autentica via Firebase Authentication.
- Apos autenticacao, o usuario entra no painel.

### 11.2 Dashboard

Rota:

- `/admin`

Fluxo:

- Mostra resumo do casamento ativo.
- Mostra atalhos para modulos administrativos.
- Mostra card do casamento com capa, nomes e contexto.
- Mostra indicios visuais da paleta.
- Ajuda a navegar rapido para convidados, padrinhos, musicas e mais.

### 11.3 Convidados

Rota:

- `/admin/convidados`

Fluxo:

- Cadastrar convidado.
- Editar convidado.
- Remover convidado.
- Ver status de presenca.
- Filtrar por status.
- Exibir totais resumidos.

### 11.4 Agenda

Rota:

- `/admin/agenda`

Fluxo:

- Cadastrar itens da programacao.
- Ordenar por `sortOrder`.
- Editar ou remover itens.
- Publicar a agenda para a area publica.

### 11.5 Presentes

Rota:

- `/admin/presentes`

Fluxo:

- Cadastrar links de presentes.
- Ordenar itens.
- Escolher o tipo do presente.
- Publicar a lista para os convidados.

### 11.6 Padrinhos

Rota:

- `/admin/padrinhos`

Fluxo:

- Gerenciar padrinhos do casal.
- Pode haver status de convite aceito ou recusado.
- Pode incluir foto e ordenacao.

### 11.7 Pessoas importantes

Rota:

- `/admin/pessoas`

Fluxo:

- Gerenciar pessoas importantes para o evento.
- Pode incluir papeis como pais, maes, pajens, daminhas e familia.
- Pode armazenar status de convite.

### 11.8 Musicas de entrada

Rota:

- `/admin/musicas`

Fluxo:

- Registrar momentos de entrada.
- Associar titulo da musica e URL opcional.
- Ordenar por exibicao.

### 11.9 Fornecedores

Rota:

- `/admin/fornecedores`

Fluxo:

- Registrar contatos de fornecedores.
- Categorizar por tipo.
- Manter dados acessiveis ao casal.

### 11.10 Recados

Rota:

- `/admin/recados`

Fluxo:

- Ler os recados deixados pelos convidados.
- Alterar visibilidade.
- Apagar mensagens quando necessario.

### 11.11 Mais

Rota:

- `/admin/mais`

Fluxo:

- Area de utilitarios administrativos e links extras.
- Pode concentrar funcoes secundarias do painel.

### 11.12 Configuracoes

Rota:

- `/admin/configuracoes`

Fluxo:

- Editar os dados do casamento.
- Definir nome do casal.
- Definir data do evento.
- Definir imagem de capa.
- Definir mensagem de boas-vindas.
- Definir links do album e mapas.
- Definir tema visual.

## 12. Modelo de dados

O banco principal e o Firestore. A estrutura esta organizada por casamento.

### 12.1 Wedding

Representa o casamento principal.

Campos existentes no codigo:

- `id`
- `slug`
- `status`
- `coupleNames`
- `eventDate`
- `coverImageUrl`
- `welcomeMessage`
- `sharedAlbumUrl`
- `ceremonyAddress`
- `ceremonyMapUrl`
- `receptionAddress`
- `receptionMapUrl`
- `theme`
- `createdAt`
- `updatedAt`

### 12.2 Guest

Representa um convidado ou grupo.

Campos:

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

### 12.3 ScheduleItem

Campos:

- `id`
- `weddingId`
- `title`
- `description`
- `startsAt`
- `locationLabel`
- `sortOrder`

### 12.4 GiftLink

Campos:

- `id`
- `weddingId`
- `title`
- `description`
- `url`
- `type`
- `sortOrder`

Tipos:

- `store`
- `pix`
- `quota`
- `other`

### 12.5 GuestMessage

Campos:

- `id`
- `weddingId`
- `guestName`
- `content`
- `isVisible`
- `createdAt`

### 12.6 WeddingPartyMember

Campos:

- `id`
- `weddingId`
- `firstName`
- `secondName`
- `side`
- `invitationStatus`
- `respondedAt`
- `photoUrl`
- `sortOrder`

### 12.7 EntranceSong

Campos:

- `id`
- `weddingId`
- `moment`
- `songTitle`
- `url`
- `sortOrder`

### 12.8 ImportantPerson

Campos:

- `id`
- `weddingId`
- `name`
- `secondName`
- `role`
- `secondRole`
- `description`
- `invitationStatus`
- `respondedAt`
- `sortOrder`

### 12.9 Vendor

Campos:

- `id`
- `weddingId`
- `name`
- `category`
- `contactName`
- `phone`
- `url`
- `notes`
- `sortOrder`

## 13. Regras de ordenacao e comportamento dos dados

Algumas colecoes sao ordenadas por `sortOrder` antes de chegar na tela:

- Agenda.
- Presentes.
- Padrinhos.
- Pessoas importantes.
- Musicas de entrada.
- Fornecedores.

Algumas listas sao filtradas:

- Recados publicos usam `isVisible == true`.

O sistema evita quebrar a tela quando dados opcionais nao existem. Isso significa:

- Sem capa, usa fundo ou placeholder.
- Sem album, nao mostra QR quebrado.
- Sem itens de agenda, pode ocultar a secao.
- Sem presentes, pode ocultar a secao.
- Sem recepcao, nao cria bloco vazio.

## 14. Tema visual e personalizacao

### 14.1 Como o tema e aplicado

O `ThemeService` observa a URL e o casamento ativo para carregar o tema do casamento correto.

Ele aplica:

- Cor primaria.
- Cor de contraste.
- Fundo.
- Superficie.
- Texto.
- Muted.
- Borda.
- Cor dos elementos do QR Code.
- Fonte script.

### 14.2 Regras de selecao do casamento

- Em rotas administrativas, usa o casamento ativo salvo no navegador.
- Em rotas publicas com slug, usa o slug da URL.
- Em rotas publicas sem slug, usa `default`.

### 14.3 Fontes

O projeto carrega fontes decorativas locais em `public/fonts` e tambem usa `Inter` e `Playfair Display` do Google Fonts.

Fontes script disponiveis:

- Bacalisties
- Brittany Signature
- Great Vibes
- Alex Brush
- Allura
- Dancing Script
- Tangerine
- Cormorant SC
- Playfair Display
- Montserrat

## 15. Direcao visual

### 15.1 Principios

- O casal deve ser o foco visual.
- A interface deve parecer afetiva, leve e elegante.
- O convidado deve entender rapidamente o que pode fazer.
- A experiencia publica precisa funcionar bem no celular.
- A area administrativa precisa ser mais funcional que romantica.

### 15.2 Paleta

O padrao atual usa:

- Fundo claro.
- Verde oliva / verde suave como cor primaria.
- Texto escuro.
- Bordas discretas.
- Sombra leve.

### 15.3 Tipografia

- Fonte script para nomes e detalhes romanticos.
- Fonte mais objetiva para textos, formularios e paines.
- Nomes dos noivos recebem maior destaque.

### 15.4 Layout publico

- Hero com imagem de capa grande.
- Degradê suave sobre a imagem.
- Conteudo centralizado.
- Blocos com bastante respiro.
- Botao principal destacado.
- Rodape fixo de navegacao.

### 15.5 Layout admin

- Cards funcionais.
- Listas densas, mas legiveis.
- Navegacao inferior fixa.
- Formularios com alvos de toque generosos.

## 16. Componentes e estados visuais

### 16.1 Estados obrigatorios

Toda tela precisa prever:

- Carregando.
- Sem dados.
- Erro ao carregar.
- Sucesso apos salvar ou enviar.
- Experiencia boa em telas pequenas.

### 16.2 Botoes

- Botao primario usa a cor primaria.
- Botao secundario usa fundo claro e borda sutil.
- Acoes principais devem ser mais fortes que as secundarias.

### 16.3 Cards

- Cartoes simples, com borda discreta.
- Evitar excesso de profundidade visual.
- Cards devem servir a repeticao ou agrupamento funcional.

### 16.4 QR Code

- Fundo branco.
- Margem suficiente.
- QR nao pode ser a unica forma de acesso.
- Deve existir botao alternativo para abrir o link.

## 17. Responsividade

O sistema foi pensado para celular primeiro.

Regras relevantes:

- Texto precisa continuar legivel em telas pequenas.
- Nada deve depender de hover.
- Menus e acoes principais precisam caber no rodape.
- Imagens usam `object-fit: cover`.
- Formularios precisam respeitar toque de dedo.
- A pagina publica nao deve criar scroll horizontal.

## 18. Servicos Firebase e inicializacao

O Angular registra:

- `provideFirebaseApp(() => initializeApp(environment.firebase))`
- `provideAuth(() => getAuth())`
- `provideFirestore(() => getFirestore())`

Tambem ha service worker ativo quando o ambiente permite.

Nao existe uso de `provideFunctions`.

## 19. Autenticacao e seguranca

### 19.1 Autenticacao

- Login de noivos via Firebase Authentication.
- Acesso administrativo protegido por guard.

### 19.2 Regras logicas

- Apenas usuarios autenticados devem editar dados administrativos.
- Convidados usam rotas publicas.
- Recados e confirmacoes sao criados por rotas publicas controladas.
- A leitura publica deve limitar-se aos dados marcados como publicos ou visiveis.

## 20. Fluxos resumidos

### Fluxo 1: visitante chega ao convite

1. Abre o link do casamento.
2. Ve foto, nomes, data e mensagem.
3. Pode seguir para local, album, presentes ou mais.
4. Pode confirmar presenca.

### Fluxo 2: convidado confirma presenca

1. Abre o formulario.
2. Preenche nome e telefone.
3. Seleciona status.
4. Opcionalmente informa acompanhantes.
5. Envia.
6. O sistema grava a resposta.
7. O painel dos noivos passa a refletir a mudanca.

### Fluxo 3: noivos gerenciam o casamento

1. Fazem login.
2. Acessam o dashboard.
3. Ajustam dados do casamento.
4. Gerenciam convidados, agenda, presentes, recados e demais modulos.
5. Publicam o resultado para a area publica.

### Fluxo 4: album compartilhado

1. Noivo salva o link do Google Fotos.
2. A pagina publica de album mostra botao e QR Code.
3. O convidado abre o link externo.

## 21. O que o SIM nao faz no MVP

- Nao hospeda fotos do album dentro da aplicacao.
- Nao usa Cloud Functions.
- Nao depende de backend customizado fora do Firebase.
- Nao implementa controle complexo de permissao por papel.
- Nao possui multi-casamento por usuario com sistema avancado de organizacao.
- Nao faz importacao de convidados por planilha.
- Nao oferece reserva de presentes ou pagamento in-app.
- Nao tem mapa embutido interativo.

## 22. Resumo operacional para outra IA

Se outra IA precisar entender rapidamente o SIM, a leitura correta e:

1. SIM e uma PWA de casamento.
2. Ha uma area publica para convidados e uma area privada para noivos.
3. O conteudo principal gira em torno de convite, confirmacao, localizacao, presentes, recados, album e agenda.
4. O tema visual vem do proprio casamento e e aplicado dinamicamente pelo Firestore.
5. O sistema e mobile-first e usa Firebase como backend.
6. O painel admin e responsavel por configurar tudo o que aparece publicamente.

