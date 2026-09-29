# SIM — Seu Incrível Momento

Aplicação web para criar o site de um casamento e organizar o evento. Reúne convite digital, confirmação de presença, informações para convidados e painel dos noivos. A interface é pensada para celular e compartilhamento por link.

Esta documentação descreve o código do repositório, revisado em 28/09/2026. Não comprova o estado dos serviços publicados nem das regras implantadas no Firebase.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Orientações para agentes](AGENTS.md) | Convenções e cuidados ao modificar o projeto |
| [Arquitetura](src/app/README.md) | Inicialização, estado, navegação e organização |
| [Núcleo e dados](src/app/core/README.md) | Serviços, modelos, persistência, autenticação e temas |
| [Área pública](src/app/pages/public/README.md) | Rotas, convites, RSVP, álbum e recados |
| [Área administrativa](src/app/pages/admin/README.md) | Módulos, demonstração, pagamento e relatórios |
| [Layout](src/app/layout/README.md) | Navegação pública e cabeçalho administrativo |
| [Componentes de UI](src/app/shared/ui/README.md) | Componentes reutilizáveis e contratos |
| [Configuração e integrações](src/environments/README.md) | Firebase, variáveis, R2 e Asaas |
| [Scripts](scripts/README.md) | Geração da configuração de ambiente |
| [Arquivos públicos](public/README.md) | Fontes, imagens, SVG de convite e PWA |
| [Operação e validação](docs/operacao/README.md) | Execução, build, deploy, verificação e diagnóstico |
| [Acesso e limitações](docs/seguranca/README.md) | Regras atuais e problemas identificados |

## Produto e fluxo

1. O visitante conhece o produto em `/` e entra ou cria conta.
2. O login aceita Google ou e-mail e senha, usando Firebase Authentication.
3. O sistema localiza um casamento vinculado ao usuário ou cria um novo, inicialmente publicado.
4. O painel exige cobrança ativa; caso contrário, redireciona para `/admin/pagamento`.
5. Os noivos configuram o casamento e compartilham `/:slug` ou links de convites individuais.
6. Convidados consultam as informações, respondem à presença e deixam recados sem login.

Um usuário pode ter vários casamentos. O casamento administrativo ativo fica no navegador; o público é escolhido pelo `slug` da URL. `/demo` usa o documento `default` do Firestore e não é um banco local de dados fictícios.

## Stack

- Angular 21, componentes standalone, TypeScript 5.9 e RxJS 7.
- AngularFire 21 RC e Firebase 12: Authentication e Firestore.
- CSS próprio e variáveis de tema; Leaflet para mapa e `qrcode` para QR codes.
- Service worker Angular e manifesto PWA.
- Integrações HTTP externas para R2 e Asaas; seus servidores não estão neste repositório.
- Configuração de Vercel para SPA. `firebase.json` configura apenas regras do Firestore.

## Executar localmente

Use uma versão de Node aceita pelo CLI instalado: `^20.19.0`, `^22.12.0` ou `>=24.0.0`. O projeto declara npm `10.9.2` como gerenciador.

```bash
npm ci
cp .env.example .env
npm start
```

Abra `http://localhost:4200`. Copie o exemplo somente se ainda não houver `.env`. Configure as integrações conforme o [guia de ambiente](src/environments/README.md); campos vazios permitem gerar a configuração, mas não habilitam upload e cobrança.

Desenvolvimento e produção apontam atualmente para o mesmo projeto Firebase. Não há conexão de emuladores configurada. Para desenvolvimento isolado, ajuste ambos os ambientes para um projeto de teste antes de gravar dados.

| Comando | Resultado |
| --- | --- |
| `npm start` | Gera ambiente e inicia o servidor Angular |
| `npm run build` | Gera ambiente e compila em produção |
| `npm run watch` | Gera ambiente e compila continuamente em desenvolvimento |
| `npm run ng -- <argumentos>` | Executa o CLI Angular local |
| `npm test` | Chama `ng test`, mas ainda não há alvo de testes configurado |

Não há suíte de testes, lint ou E2E configurados no estado documentado. Veja a [validação manual](docs/operacao/README.md).

## Estrutura

```text
src/app/
  core/          modelos, serviços, guards, constantes e utilitários
  pages/public/  site institucional e experiência dos convidados
  pages/admin/   organização e cobrança
  layout/        navegação compartilhada
  shared/ui/     componentes visuais e feedback
src/environments/ configuração Firebase e integrações
public/           imagens, fontes, manifesto e templates
scripts/          geração de ambiente
firestore.rules   autorização no banco
```

## Estado e referências anteriores

Há funcionalidades implementadas que dependem de serviços externos, páginas sem rotas ativas e falhas de autorização identificadas na leitura do código. Consulte [acesso e limitações](docs/seguranca/README.md) antes de tratar o sistema como pronto para produção.

[Contexto do produto](contexto-completo-do-sim.md), [especificação de temas](spec-criador-de-temas-casamento-sim.md), [primeiro relatório UX](Relatorio-UX-Landing-SIM.md), [segundo relatório UX](Relatorio-UX-Landing-SIM-v2.md) e [notas visuais](index.md) preservam contexto e intenções anteriores. Podem divergir do código atual; os READMEs descrevem a implementação, e especificações não comprovam que um recurso foi entregue.
