# SIM UI

Componentes reutilizaveis do design system do SIM.

[Índice geral](../../../../README.md)

Importe os componentes standalone na propriedade `imports` da página. Os componentes visuais não persistem dados: emitem eventos para a página, que chama os serviços. As cores usam tokens CSS definidos pelo tema.

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


## Contratos dos componentes

| Componente | Entradas | Saídas / comportamento |
| --- | --- | --- |
| `FloatingAddButtonComponent` | `label`, `disabled` | `pressed: void`; abre criação |
| `StatusCheckComponent` | `label` | Indicador positivo com texto |
| `ImageUploadFieldComponent` | `imageUrl`, `alt`, `emptyTitle`, `emptyDescription`, `disabled`, `uploading` | `fileSelected: Event`; o arquivo fica em `event.target.files` |
| `PhotoActionCardComponent` | `title`, `subtitle`, `imageUrl`, `initials`, `expanded` | `expandedChange: boolean`; slots `[status]`, `[actions]` e conteúdo padrão |
| `LocationMapPickerComponent` | `lat`, `lng`, `zoom` (padrão 14) | `pointSelected: { lat, lng }` |
| `AppIconComponent` | `name` obrigatório, `label` opcional | Renderiza `ion-icon`; sem label, marca o ícone como decorativo |
| `ToastOutletComponent` | Sem entradas | Exibe o estado do serviço global |

## LocationMapPickerComponent

Usa Leaflet e tiles do OpenStreetMap, permite escolher coordenadas com clique/toque e atualiza o marcador. O ponto de fallback é São Paulo. Remove o mapa ao destruir o componente. Não faz geocodificação de endereço.

```html
<app-location-map-picker
  [lat]="location.lat"
  [lng]="location.lng"
  (pointSelected)="setLocationPoint(index, $event)"
/>
```

## AppIconComponent

Centraliza acessibilidade e estilo dos Ionicons. O carregamento dos scripts de ícones fica em `src/index.html`. Use `label` se o ícone transmitir informação sem texto equivalente; em botões, preserve também o nome acessível da ação.

## Ciclo dos toasts

`ToastService` oferece `success`, `error`, `info` e `dismiss`. O estado usa signal, mantém até três mensagens e remove cada uma após 3,8 segundos. O outlet já é renderizado por `App`; não crie outlets duplicados por página.

As regras acima orientam novas alterações. Algumas páginas existentes ainda possuem feedback local; não presuma que todo o legado já segue o padrão.
