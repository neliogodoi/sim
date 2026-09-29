# Orientações para trabalhar no SIM

## Escopo

Estas orientações valem para todo o repositório. Arquivos `AGENTS.md` em subdiretórios complementam o contexto local. Leia o [README](README.md) e o README da área antes de editar. A documentação está em português; preserve esse idioma nas explicações e na interface.

## Organização

- Mantenha componentes Angular standalone e carregamento de páginas via `loadComponent`.
- Use `core/models/wedding.models.ts` como contrato de dados e `WeddingService` para persistência do domínio.
- Resolva o casamento público pelo parâmetro da rota e o administrativo por `WeddingContextService`. Passe o identificador explicitamente às operações; muitos métodos usam `default` quando omitido.
- Preserve a ordem de rotas específicas antes de `:slug` e `**`.
- Reutilize `shared/ui` e as variáveis CSS de tema. Preserve navegação mobile e impressão dos convites.
- Siga o estilo do arquivo editado. Não reformate áreas alheias à tarefa.

## Dados e integrações

- Desenvolvimento e produção usam atualmente o mesmo Firebase. Não presuma isolamento nem conecte testes com escrita a esse projeto por padrão.
- Não inclua valores de `.env`, tokens reais ou dados de convidados na documentação, logs ou commits.
- `environment.generated.ts` é gerado e ignorado pelo Git. Altere o gerador ou as entradas, não mantenha uma cópia manual.
- Variáveis incorporadas no frontend são visíveis ao navegador. Não coloque credenciais administrativas ou chaves privadas de provedores nelas.
- Guards são controle de navegação, não autorização do banco. Ao mudar dados ou acesso, revise `firestore.rules` e o [registro de limitações](docs/seguranca/README.md).
- Não replique a criação irrestrita de proprietários nem o controle de cobrança pelo cliente como padrões seguros.
- `/demo` usa `default` real. Preserve a intenção de consulta e verifique métodos de escrita, não só botões desabilitados.

## Validação e entrega

- Para mudanças de código/configuração, execute `npm run build` e verificações proporcionais ao fluxo alterado. Relate falhas e limitações sem afirmar testes não realizados.
- `npm test` ainda não tem alvo configurado. Não declare cobertura automatizada existente.
- Para documentação, confira caminhos, links relativos, rotas, nomes e comandos contra o código; não é necessário compilar apenas por alterar Markdown.
- Não execute deploy, checkout de pagamento ou escritas remotas como efeito de validar documentação.
- Atualize os READMEs afetados quando mudar rotas, contratos, configuração, regras ou comportamento. Distinga implementação atual de propostas e dívida técnica.
