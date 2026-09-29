# Orientações da UI compartilhada

Leia o [catálogo](README.md) antes de criar ou alterar componentes.

- Preserve os contratos de inputs/outputs e atualize todos os consumidores quando houver mudança.
- Mantenha componentes visuais independentes de Firestore, casamento ativo e cobrança. A página trata eventos e persistência.
- Reutilize tokens CSS em vez de fixar cores específicas de casamento.
- Preserve labels acessíveis, foco, estados disabled/uploading e interação por teclado.
- Use o outlet global de toasts para feedback de ações; não duplique o outlet em páginas.
- Mantenha upload na página via `fileSelected` e não introduza campo manual de URL onde o componente de upload é usado.
- Verifique os consumidores públicos e administrativos e os efeitos em telas pequenas ao mudar componentes compartilhados.
