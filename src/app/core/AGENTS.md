# Orientações do núcleo

Leia o [README local](README.md) e mantenha modelos, serviços e regras coerentes.

- Passe `weddingId` explicitamente em novos fluxos; não use o fallback `default` como identificação de usuário.
- Ao alterar propriedade, cobrança ou escrita pública, examine `firestore.rules`; guards e campos de formulário não são barreiras de autorização.
- Preserve os valores persistidos de status e a compatibilidade com temas e locais antigos, ou documente a migração necessária.
- Não confunda os fallbacks `[]` e `undefined` com prova de que a consulta foi bem-sucedida.
- Evite incluir lógica visual de páginas em serviços de persistência e mantenha efeitos HTTP nos serviços de integração.
- Para mudanças de regras, valide separadamente usuário anônimo, proprietário e usuário sem vínculo em ambiente isolado. Não trate build Angular como validação de regras.
