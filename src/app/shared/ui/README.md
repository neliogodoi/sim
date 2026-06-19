# SIM UI

Componentes reutilizaveis do design system do SIM.

## FloatingAddButtonComponent

Botao flutuante de criacao usado em telas administrativas com listas e formularios.

Uso:

```html
<app-floating-add-button label="Adicionar convidado" [disabled]="isDemoMode()" (pressed)="openForm()" />
```

Regras:

- Usar apenas para abrir formularios de criacao.
- Manter o texto acessivel em `label`.
- Nao duplicar estilos do FAB em CSS de pagina.

## ToastService + ToastOutletComponent

Feedback global de sucesso, erro e informacao no topo da tela.

Uso:

```ts
this.toastService.success('Tema salvo.');
this.toastService.error('Nao foi possivel salvar.');
```

Regras:

- Nao renderizar `<p class="success-state">` ou `<p class="error-state">` para confirmacoes de acao.
- Usar mensagens curtas e acionaveis.

## StatusCheckComponent

Indicador visual positivo para estados como `Aceitou` e `Confirmou`.

Uso:

```html
<app-status-check label="Confirmou" />
```

## ImageUploadFieldComponent

Campo visual de upload com preview e acao de trocar imagem.

Regras:

- Nao expor campo de URL manual quando este componente for usado.
- O upload deve ser tratado pela pagina via `(fileSelected)`.

## PhotoActionCardComponent

Card expansivel para pessoas com foto. Ao expandir, mostra a foto maior e projeta as acoes no canto superior direito.
