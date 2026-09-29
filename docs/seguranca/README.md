# Acesso, limitações e dívida técnica

[Índice geral](../../README.md)

Esta análise descreve [firestore.rules](../../firestore.rules) e o cliente presentes no repositório em 28/09/2026. Não foi conferida a versão das regras implantadas, nem o código dos endpoints externos. Os problemas abaixo estão documentados, não corrigidos.

## Regras atuais

`isOwner` verifica a existência de `weddings/{id}/owners/{uid}` para o usuário autenticado. `canReadWedding` aceita `default`, casamento publicado ou proprietário. Escrita pública aceita casamento publicado diferente de `default`.

| Recurso | Leitura | Escrita |
| --- | --- | --- |
| Casamento | `default`, publicado ou proprietário | Criação por autenticado; alteração/exclusão por proprietário |
| Proprietários | Usuário autenticado no próprio UID | Mesmo critério, sem exigir vínculo anterior |
| Convidados | Documento individual: quem lê casamento; lista: proprietário ou `default` | Criação/alteração pública se publicado e não default, ou por proprietário; exclusão por proprietário |
| Agenda, presentes, músicas | Quem lê casamento | Proprietário |
| Padrinhos | Quem lê casamento | Proprietário; público pode alterar apenas resposta/data com status permitido |
| Pessoas especiais | Documento individual: quem lê casamento; lista: proprietário ou `default` | Proprietário; mesma exceção pública de resposta/data |
| Fornecedores | Proprietário ou `default` | Proprietário |
| Recados | Proprietário, `default` ou mensagem visível de casamento legível | Criação pública se publicado e não default; alteração/exclusão por proprietário |
| Índice `userWeddings` | Próprio usuário, nas subcoleções | Próprio usuário ou proprietário do casamento, conforme operação; gravação valida `weddingId` |

O documento pai `userWeddings/{uid}` não é acessível; a permissão está em sua subcoleção. O restante do banco é negado pelo catch-all.

## Problemas de autorização identificados

1. **Propriedade sem vínculo prévio.** A regra de `owners/{uid}` permite a qualquer usuário autenticado gravar o próprio UID sob qualquer casamento. Como `isOwner` depende apenas desse documento, a regra permite obter os privilégios correspondentes. `ensureOwner` é chamado por fluxos do cliente. A concessão de propriedade precisa ser restrita antes de confiar no isolamento entre casais.
2. **Cobrança modificável pelo proprietário.** A atualização do casamento não restringe campos; `billing` está no mesmo documento. O guard premium é somente cliente e usa esse campo. Falta uma fronteira de escrita confiável para o estado de pagamento.
3. **Alteração pública ampla de convidados.** Em casamentos publicados, `create/update` não restringe campos, quantidade ou identidade do autor. Ter o ID de um convite permite alterar seu documento dentro dessas regras; o link não é autenticação do convidado.
4. **Campos públicos no documento do casamento.** Um casamento publicado permite ler todo o documento, incluindo eventual `billing` e IDs de cobrança. As regras não oferecem leitura parcial de campos.
5. **Recados sem validação de conteúdo nas regras.** O cliente envia mensagens visíveis, e as regras de criação não limitam o payload. Não há moderação prévia ou limitação de frequência implementada nessas regras.
6. **Demo não é imutável globalmente.** `default` bloqueia a exceção de escrita pública, mas proprietários ainda podem escrever. Configurações e tema não têm bloqueio uniforme de demo e podem chamar `ensureOwner` se houver sessão autenticada.

## Integrações e fronteiras

- `R2_UPLOAD_TOKEN` é incorporado ao bundle: não é segredo de servidor. O endpoint externo precisa impor seus próprios controles.
- As chamadas de cobrança não enviam explicitamente token Firebase. Não há backend aqui para confirmar autorização, propriedade, verificação de valores ou webhooks.
- O convite de padrinhos usa `bypassSecurityTrustHtml` em SVG construído a partir de template local. Não amplie a origem para HTML/SVG arbitrário sem rever sanitização.
- Bloqueios de botão, guards, IDs no localStorage e validações de formulário não substituem autorização remota.

## Outras limitações

- Não há testes automatizados/configuração de emuladores. Compilar não valida permissões.
- Criação de casamento, proprietário e índice não é atômica.
- Erros de leitura podem virar dados vazios e prejudicar diagnóstico/bootstrap.
- Páginas públicas de agenda, padrinhos e músicas existem sem rotas ativas.
- Relatório soma registros sem deduplicação e inclui convidados recusados no total.
- Datas são strings, com suporte legado em alguns pontos; não há formato único imposto pelas regras.
- Desenvolvimento e produção apontam para o mesmo Firebase, e demo usa documentos reais.

Ao tratar estes itens, mantenha separados o comportamento atual, a correção proposta e a validação realizada. Para regras, cubra anônimo, proprietário e usuário sem vínculo em ambiente isolado antes de publicar.
