# Área administrativa

[Índice geral](../../../../README.md)

## Rotas e módulos

| Rota | Diretório | Responsabilidade |
| --- | --- | --- |
| `/admin/login` | `login` | Entrar por Google ou e-mail/senha |
| `/admin/cadastro` | `register` | Criar conta; também oferece Google |
| `/admin/pagamento` | `payment` | Checkout e consulta de status Asaas |
| `/admin` | `dashboard` | Resumo, seleção/criação de casamento, contagens e compartilhamento |
| `/admin/convidados` | `guests` | Cadastro, edição, busca, exclusão, status e convite por WhatsApp |
| `/admin/agenda` | `schedule` | Datas, horários, descrição e local dos eventos |
| `/admin/presentes` | `gifts` | Links de lojas, Pix, cotas e outros |
| `/admin/padrinhos` | `wedding-party` | Nomes, lado, fotos, respostas e links/impressão de convites |
| `/admin/pessoas` | `important-people` | Pessoas especiais, papéis, fotos e convites |
| `/admin/musicas` | `entrance-songs` | Música e URL por momento da cerimônia |
| `/admin/fornecedores` | `vendors` | Categoria e dados de contato |
| `/admin/relatorio` | `capacity-report` | Quantidades e estimativas de espaço |
| `/admin/recados` | `messages` | Visibilidade e exclusão de mensagens |
| `/admin/tema` | `theme` | Cor principal, estilo, fonte e paleta gerada |
| `/admin/mais` | `more` | Atalhos administrativos e ações da conta |
| `/admin/configuracoes` | `settings` | Dados do casal, capa, data, mensagem, álbum e locais |

`auth` contém CSS compartilhado pelas telas de autenticação, sem rota própria. Login/cadastro usam `loginGuard`; pagamento usa `adminGuard`; os demais módulos usam `adminGuard` e `premiumGuard`.

## Casamento ativo e cadastro

Login/cadastro concluem o bootstrap antes de navegar ao painel. O dashboard consulta o índice do usuário e permite alternar o contexto ativo. A seleção é salva em `localStorage`, não na URL administrativa. O dashboard também cria casamentos com preset visual inicial e ID derivado do nome mais parte de UUID.

O fluxo de criação grava um casamento publicado e sem cobrança ativa. O acesso seguinte a uma rota premium pode redirecionar ao pagamento. Não existe período de teste implementado no guard.

## Demonstração

Todos os módulos administrativos da tabela, exceto login, cadastro e pagamento, têm equivalente `/demo` ou `/demo/<seção>`. Reutilizam os mesmos componentes, com `demoAdminGuard`, sem exigir login. `/default/admin` e `/default/admin/:section` são aliases para demo.

A demo lê o casamento `default` do Firestore. Várias ações CRUD verificam `isDemoMode`, mas a proteção não é uniforme: configurações e tema possuem métodos de gravação sem essa verificação e chamam `ensureOwner` para usuários autenticados. Portanto, não considere demo um ambiente isolado ou globalmente imutável.

## Configurações e tema

Configurações salva `locations` com ordem, endereço e coordenadas, além de preencher os campos antigos de cerimônia/recepção a partir dos dois primeiros locais. O upload de capa persiste a URL após sucesso, sem aguardar o salvamento geral do formulário. O slug exibido corresponde ao ID ativo; não há migração de documentos para trocar esse ID.

A tela de tema possui seletores expansíveis de fonte e receita, preview e seis amostras principais de cor. Receitas: Elegante, Romântico, Editorial, Cerimonial, Moderno e Marcante. A geração é local e a aplicação grava `Wedding.theme`. Detalhes no [núcleo](../../core/README.md).

## Cobrança

A página exibe preço fixo de `104.99` no código; isso não prova o preço cobrado pela API. Ao iniciar checkout, chama o serviço e navega para `checkoutUrl`. A consulta manual chama `/sync`; o documento do casamento é observado pelo Firestore. A página não persiste diretamente o objeto `billing` retornado pela API.

O status premium depende de `active` e da validade opcional. A implementação externa de checkout/webhook não está neste repositório. Veja [contratos HTTP](../../../environments/README.md).

## Relatório de capacidade

O cálculo soma dois noivos, nomes preenchidos de padrinhos/pessoas especiais, `guestCount` de todos os convidados e um por registro de fornecedor. Quantidades de convidados são limitadas a pelo menos um. `maybe` entra na contagem de pendentes.

As estimativas de espaço são `total × 1.2` e `total × 1.8`. O total inclui recusados, não elimina duplicidade de pessoas entre módulos e não conhece o tamanho das equipes dos fornecedores. É uma estimativa do cadastro, não uma medição de ocupação confirmada nem uma regra técnica de segurança de eventos.

## Compartilhamento

Links públicos usam o ID ativo; há atalhos de WhatsApp, cópia, impressão e compartilhamento nativo com fallback para clipboard no dashboard. São ações do navegador; não há envio automatizado de mensagens por um servidor deste projeto.
