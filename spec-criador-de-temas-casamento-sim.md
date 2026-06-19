# SIM — Especificação da Funcionalidade: Criador de Temas de Casamento

## 1. Objetivo

Criar uma funcionalidade no painel administrativo do SIM que permita ao casal gerar uma paleta visual elegante para o casamento a partir de uma única cor principal.

A funcionalidade deve:

- Permitir que o usuário escolha uma cor principal.
- Gerar automaticamente 3 tons derivados da mesma cor em escala monocromática.
- Gerar uma cor de contraste baseada em regras de harmonia cromática.
- Exibir uma prévia visual do tema antes de aplicar.
- Salvar o tema no objeto `theme` do casamento no Firestore.

Essa funcionalidade deve reforçar a proposta do SIM como uma experiência elegante, personalizada e emocional para casamentos.

---

## 2. Local da funcionalidade

A funcionalidade deve ser implementada na área administrativa, preferencialmente na rota:

```txt
/admin/configuracoes
```

Dentro da seção de personalização visual do casamento.

Nome sugerido da seção:

```txt
Criador de tema
```

Subtítulo sugerido:

```txt
Escolha uma cor principal e o SIM cria uma paleta elegante para o seu casamento.
```

---

## 3. Comportamento esperado

### 3.1 Escolha da cor principal

O usuário deve escolher uma cor principal usando um input do tipo color.

Exemplo:

```html
<input type="color" [(ngModel)]="primaryColor" />
```

Essa cor será a base do tema.

Exemplo:

```ts
primaryColor = '#8A3A4A';
```

---

### 3.2 Geração da escala monocromática

A partir da cor principal, o sistema deve gerar 3 tons mais claros da mesma cor.

Resultado esperado:

```ts
{
  primary: '#8A3A4A',
  primarySoft: '#A85D6B',
  primaryLight: '#C98793',
  primaryPale: '#E7C6CC'
}
```

Uso sugerido:

| Campo | Uso visual |
|---|---|
| `primary` | Botões principais, ícones ativos, destaques fortes |
| `primarySoft` | Cards destacados, elementos secundários |
| `primaryLight` | Fundos suaves de seções |
| `primaryPale` | Fundo geral delicado, detalhes decorativos |

A escala deve ser gerada manipulando a luminosidade da cor em HSL.

---

### 3.3 Escolha da regra de contraste

O usuário deve poder escolher uma regra de harmonia cromática.

No MVP, implementar apenas estas 3 opções:

```ts
type ContrastRule = 'analogous' | 'complementary' | 'triadic';
```

Labels para interface:

| Valor técnico | Label | Intenção visual |
|---|---|---|
| `analogous` | Elegante | Mais harmônico, suave e romântico |
| `complementary` | Marcante | Mais contraste e presença visual |
| `triadic` | Editorial | Mais criativo e sofisticado |

Regra padrão recomendada:

```ts
contrastRule = 'analogous';
```

---

### 3.4 Cálculo da cor de contraste

A cor de contraste deve ser calculada no círculo cromático usando o valor HSL da cor principal.

Regras:

```ts
analogous: h + 30
complementary: h + 180
triadic: h + 120
```

A matiz final deve ser normalizada entre `0` e `360`.

Exemplo:

```ts
function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}
```

Para manter a elegância visual do SIM, a cor de contraste não deve ser extremamente clara nem extremamente escura.

A luminosidade da cor de contraste deve ficar preferencialmente entre:

```ts
28 <= lightness <= 55
```

---

## 4. Modelo final do tema

O objeto final gerado deve seguir este formato:

```ts
export interface WeddingTheme {
  primary: string;
  primarySoft: string;
  primaryLight: string;
  primaryPale: string;

  contrast: string;
  contrastSoft: string;

  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;

  scriptFont: string;
  contrastRule: ContrastRule;
}
```

Exemplo final:

```ts
{
  primary: '#8A3A4A',
  primarySoft: '#A85D6B',
  primaryLight: '#C98793',
  primaryPale: '#E7C6CC',

  contrast: '#3A8A7A',
  contrastSoft: '#A7D2C8',

  background: '#FAF7F6',
  surface: '#FFFFFF',
  text: '#2A1D20',
  muted: '#8C7479',
  border: '#E8DADC',

  scriptFont: 'Brittany Signature',
  contrastRule: 'analogous'
}
```

---

## 5. Serviço de geração de tema

Criar um serviço Angular:

```txt
src/app/core/services/theme-generator.service.ts
```

Responsabilidade do serviço:

- Converter HEX para HSL.
- Converter HSL para HEX.
- Gerar tons monocromáticos.
- Gerar cor de contraste.
- Gerar objeto completo do tema.

Interface sugerida:

```ts
export type ContrastRule = 'analogous' | 'complementary' | 'triadic';

export interface GeneratedWeddingTheme {
  primary: string;
  primarySoft: string;
  primaryLight: string;
  primaryPale: string;
  contrast: string;
  contrastSoft: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  contrastRule: ContrastRule;
}
```

Assinatura principal:

```ts
generateTheme(primaryColor: string, contrastRule: ContrastRule): GeneratedWeddingTheme
```

---

## 6. Algoritmo sugerido

### 6.1 Geração monocromática

```ts
primarySoft = lighten(primary, 16)
primaryLight = lighten(primary, 34)
primaryPale = lighten(primary, 58)
```

A função `lighten` deve alterar a luminosidade HSL, preservando matiz e saturação.

---

### 6.2 Geração do contraste

```ts
const contrastHueMap = {
  analogous: h + 30,
  complementary: h + 180,
  triadic: h + 120
};
```

Depois de calcular a nova matiz:

```ts
contrast = hslToHex({
  h: normalizeHue(contrastHue),
  s: clamp(s, 25, 70),
  l: clamp(l, 28, 55)
});
```

`contrastSoft` deve ser uma versão clareada da cor de contraste:

```ts
contrastSoft = lighten(contrast, 42)
```

---

### 6.3 Cores neutras

As cores neutras devem ser geradas de forma segura para leitura.

Sugestão inicial:

```ts
background = '#FAF7F6'
surface = '#FFFFFF'
text = '#2A1D20'
muted = '#8C7479'
border = '#E8DADC'
```

Em uma versão futura, essas cores podem ser derivadas da cor principal com baixa saturação.

---

## 7. Interface visual

A seção deve conter:

1. Título: `Criador de tema`
2. Descrição curta.
3. Input de cor principal.
4. Seletor da regra de contraste.
5. Prévia da paleta.
6. Prévia aplicada em componentes reais.
7. Botão `Aplicar tema`.

---

## 8. Prévia da paleta

Exibir swatches com labels:

```txt
Principal
Suave
Claro
Pálido
Contraste
Contraste suave
```

Cada swatch deve mostrar:

- Cor visual.
- Nome do token.
- Valor hexadecimal.

---

## 9. Prévia aplicada

Criar um card de prévia simulando a experiência pública do casamento.

Conteúdo sugerido:

```txt
Ana & Lucas
Faltam 120 dias
Estamos preparando cada detalhe para viver esse momento com vocês.
[Confirmar presença]
```

A prévia deve aplicar:

- `primary` no botão principal.
- `primaryPale` no fundo do card.
- `contrast` em pequenos detalhes decorativos.
- `text` no texto principal.
- `muted` no texto secundário.

---

## 10. Salvamento no Firestore

Ao clicar em `Aplicar tema`, atualizar o documento do casamento ativo.

Campo a atualizar:

```ts
theme: GeneratedWeddingTheme & {
  scriptFont: string;
}
```

Preservar a fonte script já escolhida pelo usuário.

Exemplo:

```ts
const currentScriptFont = wedding.theme?.scriptFont ?? DEFAULT_SCRIPT_FONT;

const generatedTheme = this.themeGenerator.generateTheme(
  this.primaryColor,
  this.contrastRule
);

await this.weddingService.updateWedding(wedding.id, {
  theme: {
    ...generatedTheme,
    scriptFont: currentScriptFont
  }
});
```

---

## 11. Regras importantes

- Não sobrescrever a fonte script sem necessidade.
- Não salvar automaticamente a cada mudança de cor.
- Só salvar quando o usuário clicar em `Aplicar tema`.
- A prévia deve atualizar instantaneamente conforme a cor muda.
- A funcionalidade deve funcionar bem em mobile.
- O contraste mínimo entre texto e fundo deve ser preservado.
- Evitar cores muito saturadas ou agressivas na aplicação final.

---

## 12. Estados da interface

A seção deve prever:

### Estado inicial

Usa a cor atual do casamento ou uma cor padrão elegante.

Cor padrão sugerida:

```ts
#8A3A4A
```

### Estado gerando prévia

A geração é local e instantânea. Não precisa loader.

### Estado salvando

Desabilitar botão e mostrar texto:

```txt
Aplicando...
```

### Estado sucesso

Mostrar mensagem:

```txt
Tema aplicado com sucesso.
```

### Estado erro

Mostrar mensagem:

```txt
Não foi possível aplicar o tema. Tente novamente.
```

---

## 13. Critérios de aceite

A implementação será considerada pronta quando:

- O usuário conseguir escolher uma cor principal.
- O sistema gerar 3 tons monocromáticos.
- O sistema gerar uma cor de contraste baseada na regra escolhida.
- A prévia da paleta atualizar em tempo real.
- A prévia visual simular corretamente o tema aplicado.
- O botão `Aplicar tema` salvar o tema no Firestore.
- A fonte script existente for preservada.
- O tema salvo for refletido nas páginas públicas pelo `ThemeService` existente.
- A tela funcionar corretamente em mobile.

---

## 14. Melhorias futuras

Não implementar agora, mas deixar o código preparado para expansão futura:

- Regra meio-complementar.
- Regra retângulo.
- Regra quadrado.
- Paletas prontas por estilo: clássico, boho, marsala, lavanda, oliva, rosé, fendi.
- Validação automática de contraste WCAG.
- Sugestão de fontes com base na paleta.
- Exportar paleta para imagem ou PDF.
- Aplicar tema também aos convites impressos SVG.

---

## 15. Prioridade

Prioridade recomendada: alta.

Motivo: essa funcionalidade aumenta a percepção de personalização, elegância e valor do SIM sem exigir backend, pagamento ou infraestrutura adicional.
