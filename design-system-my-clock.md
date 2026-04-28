# DESIGN SYSTEM — TOKENS SEMÂNTICOS

## Visão geral do app

Este design system define a base visual do aplicativo de cálculo de horas trabalhadas para funcionários de fábrica, com foco em registro de ponto, cálculo de intervalo, overtime semanal e estimativa de pagamento bruto. A proposta segue uma direção visual inspirada na clareza, neutralidade e hierarquia da Apple, priorizando legibilidade, feedback de estado e interfaces responsivas mobile-first.[web:1][web:8][web:10]

O sistema foi estruturado para telas de uso recorrente e alta frequência, como registro de horários, resumo semanal, conferência de overtime e revisão de cálculos. Por isso, a linguagem visual favorece superfícies limpas, contraste alto, ações primárias evidentes e componentes previsíveis em todos os estados interativos.[web:1][web:10][web:13]

## Princípios de interface

- Clareza acima de decoração: informação crítica de jornada, saldo e pagamento deve aparecer com leitura imediata.[web:8][web:10]
- Hierarquia por contraste e espaçamento: títulos, números e CTAs usam destaque controlado; textos de apoio permanecem discretos.[web:1][web:8]
- Consistência semântica: o mesmo token sempre representa o mesmo papel visual no produto.
- Mobile-first: a experiência principal começa no celular e expande para desktop sem mudar o significado dos componentes.[web:10]
- Acessibilidade visível: foco, pressed, disabled e feedback de erro/sucesso são obrigatórios em todos os elementos interativos.[web:1][web:9][web:13]

## Contexto do produto

### Objetivo principal

Ajudar o usuário a registrar e conferir com precisão:

- Horário de entrada.
- Início e fim de intervalo.
- Horário de saída.
- Total diário trabalhado.
- Overtime acumulado na semana.
- Estimativa de pagamento bruto semanal.

### Fluxos principais

1. Registrar horários do dia.
2. Validar regras automáticas da empresa, como início de turno, intervalo mínimo e overtime semanal.
3. Visualizar resumo diário e semanal.
4. Corrigir ou revisar registros antes do fechamento.

### Tom visual

- Simples.
- Técnico, mas amigável.
- Preciso.
- Confiável.
- Leve, sem aparência “industrial pesada”.

## Paleta de cores

A paleta abaixo traduz a referência de interface da Apple para um contexto de app utilitário: fundos claros, contraste alto, azul como ação principal e cores de status bem reconhecíveis. A Apple recomenda o uso de cores semânticas adaptáveis e contraste consistente entre texto e superfície.[web:1][web:8]

### Mapeamento de cores reais → tokens

| Token | Valor | Uso |
|---|---|---|
| `text-primary` | `#1D1D1F` | Títulos, números principais, texto crítico |
| `text-secondary` | `#6E6E73` | Descrições, labels auxiliares, legenda |
| `text-muted` | `#8E8E93` | Placeholder, hint, texto desabilitado |
| `text-on-dark` | `#FFFFFF` | Texto sobre fundo escuro |
| `text-on-brand` | `#FFFFFF` | Texto sobre ação primária |
| `surface-page` | `#F5F5F7` | Fundo principal da aplicação |
| `surface-section` | `#FBFBFD` | Blocos alternados e áreas de respiro |
| `surface-card` | `#FFFFFF` | Cards, inputs, painéis de resumo |
| `surface-subtle` | `#F2F2F7` | Destaques leves, áreas auxiliares |
| `surface-elevated` | `#FFFFFF` | Dropdowns, sheets, modais |
| `action-primary` | `#0071E3` | Botão principal, link principal |
| `action-primary-hover` | `#0077ED` | Hover de ação primária |
| `action-primary-active` | `#0068D1` | Pressed de ação primária |
| `action-secondary` | `#F5F5F7` | Fundo de botões secundários |
| `action-strong` | `#1D1D1F` | CTA forte, confirmação de fechamento |
| `action-strong-hover` | `#2D2D30` | Hover do CTA forte |
| `border-default` | `#D2D2D7` | Bordas padrão |
| `border-subtle` | `#E5E5EA` | Divisórias leves |
| `border-focus` | `#0071E3` | Focus ring |
| `status-success` | `#34C759` | Sucesso, cálculo validado |
| `status-warning` | `#FF9F0A` | Atenção, revisão necessária |
| `status-error` | `#FF3B30` | Erro, inconsistência de ponto |

### Regras de aplicação das cores

- `action-primary` deve aparecer apenas nas ações principais, como “Calcular”, “Salvar registro” e “Fechar semana”, mantendo o destaque visual contido, como recomendado pela lógica de foco em ações primárias da Apple.[web:7][web:13]
- `action-strong` deve ser reservado para ações de confirmação de alto peso, como fechamento semanal ou aprovação final do cálculo.
- `surface-page` e `surface-card` devem dominar a interface; cores de status entram como apoio funcional, nunca como decoração.[web:1][web:8]
- `text-secondary` e `text-muted` não substituem `text-primary` em valores críticos como horas totais, overtime e pagamento bruto.[web:1][web:9]

## Tipografia

A escala tipográfica deve ser aplicada sem exceções, usando apenas os tokens fornecidos.

### Hierarquia recomendada

| Contexto | Tokens |
|---|---|
| Hero ou número principal de resumo | `text-5xl` + `font-bold` |
| Título de tela | `text-4xl` + `font-bold` |
| Título de seção | `text-3xl` + `font-semibold` |
| Título de card | `text-2xl` + `font-semibold` |
| Subtítulo | `text-xl` + `font-medium` |
| Valor destacado | `text-lg` + `font-semibold` |
| Corpo padrão | `text-base` + `font-normal` |
| Texto auxiliar | `text-sm` + `font-normal` |
| Badge e labels pequenos | `text-xs` + `font-medium` |

### Regras tipográficas

- Use `text-base` como tamanho padrão para leitura de dados e formulários.
- Use `text-sm` para textos de apoio, nunca para números críticos.
- Use `text-xs` apenas em badges, chips e microcopy funcional.
- Botões devem usar `font-semibold` para reforçar clareza e clique.

## Espaçamento

O layout deve seguir rigorosamente os tokens definidos.

### Aplicação prática

| Contexto | Tokens |
|---|---|
| Espaço entre ícone e texto | `space-1` ou `space-2` |
| Gap entre label e input | `space-2` |
| Gap interno entre blocos de um card | `space-3` |
| Padding padrão de componentes pequenos | `space-4` |
| Padding interno de cards | `space-6` |
| Espaço entre cards na mesma tela | `space-4` ou `space-6` |
| Espaço entre seções | `space-8` |
| Padding de seções | `space-12` |
| Padding vertical de seções grandes | `space-16` |
| Bloco de destaque principal | `space-20` |

### Regras de composição

- Em mobile, a maior parte das telas deve usar `space-4` nas margens laterais e `space-6` entre blocos principais.
- Em desktop, as mesmas estruturas podem expandir para `space-8` e `space-12`, sem mudar a lógica interna dos componentes.
- Nunca reduzir o espaçamento de campos críticos a menos de `space-2`, para preservar legibilidade e toque confortável.[web:10]

## Bordas e sombras

### Radius

| Elemento | Tokens |
|---|---|
| Badges e pills | `radius-full` |
| Inputs e pequenos controles | `radius-sm` |
| Botões | `radius-md` |
| Cards compactos | `radius-lg` |
| Cards principais | `radius-xl` |
| Destaques hero ou resumo principal | `radius-2xl` |

### Sombras

| Token | Uso |
|---|---|
| `shadow-sm` | Inputs e hover sutil |
| `shadow-md` | Dropdowns e elementos elevados leves |
| `shadow-lg` | Modais, sheets e popovers |
| `shadow-card` | Card padrão |
| `shadow-card-hover` | Hover do card |
| `shadow-button-primary` | Botão primário |

### Regra visual

A sombra deve comunicar elevação com discrição. O visual de referência da Apple tende a privilegiar superfícies limpas, bordas sutis e profundidade leve em vez de efeitos pesados.[web:3][web:4]

## Componentes documentados

### Botão Primary

**Tokens base**

- Background: `action-primary`
- Texto: `text-on-brand`
- Radius: `radius-md`
- Sombra: `shadow-button-primary`
- Espaçamento interno: `space-4` horizontal e `space-3` vertical
- Tipografia: `text-base` + `font-semibold`

**Estados**

- Default: fundo `action-primary`.
- Hover: fundo `action-primary-hover`.
- Active: fundo `action-primary-active`.
- Focus: ring com `border-focus`.
- Disabled: manter estrutura, reduzir opacidade e usar cursor `not-allowed`.[web:13]

**Uso ideal**

- Calcular jornada.
- Salvar registro.
- Aplicar correção.
- Confirmar fechamento.

### Botão Secondary

**Tokens base**

- Background: `surface-card`
- Texto: `text-primary`
- Borda: `border-default`
- Radius: `radius-md`
- Tipografia: `text-base` + `font-semibold`
- Espaçamento interno: `space-4` horizontal e `space-3` vertical

**Estados**

- Default: fundo `surface-card`, borda `border-default`.
- Hover: fundo `surface-subtle`.
- Active: manter fundo claro com contraste maior de borda.
- Focus: ring com `border-focus`.
- Disabled: opacidade reduzida e perda de destaque.

**Uso ideal**

- Editar.
- Cancelar.
- Ver detalhes.
- Exportar resumo.

### Botão Strong (CTA)

**Tokens base**

- Background: `action-strong`
- Texto: `text-on-dark`
- Radius: `radius-md`
- Sombra: `shadow-lg`
- Tipografia: `text-base` + `font-semibold`

**Estados**

- Default: fundo `action-strong`.
- Hover: fundo `action-strong-hover`.
- Active: reforçar contraste mantendo o mesmo papel visual.
- Focus: ring com `border-focus`.
- Disabled: opacidade reduzida e cursor `not-allowed`.

**Uso ideal**

- Fechar semana.
- Confirmar cálculo final.
- Aprovar ajuste de horas.

### Card padrão

**Tokens base**

- Background: `surface-card`
- Radius: `radius-xl`
- Shadow: `shadow-card`
- Padding: `space-6`
- Border opcional: `border-subtle`

**Estrutura recomendada**

- Cabeçalho com título e ação secundária.
- Corpo com dados resumidos.
- Rodapé opcional com status ou CTA.

**Estados**

- Default: `shadow-card`.
- Hover: `shadow-card-hover`.
- Active: aplicar variação leve de superfície.
- Focus: ring se o card for clicável.
- Disabled: opacidade reduzida e remoção de hover forte.

**Uso ideal**

- Resumo do dia.
- Resumo semanal.
- Card de overtime.
- Card de pagamento bruto.
- Card de inconsistências detectadas.

### Input

**Tokens base**

- Background: `surface-card`
- Border: `border-default`
- Radius: `radius-sm`
- Padding interno: `space-4`
- Texto: `text-primary`
- Placeholder: `text-muted`
- Tipografia: `text-base` + `font-normal`

**Estados**

- Default: borda `border-default`.
- Hover: contraste um pouco maior de borda.
- Active: manter estabilidade, sem pular layout.
- Focus: ring com `border-focus` e destaque claro de foco.[web:1][web:9]
- Disabled: fundo `surface-subtle`, texto `text-muted`, cursor `not-allowed`.

**Uso ideal**

- Hora de entrada.
- Saída para intervalo.
- Retorno do intervalo.
- Hora de saída.
- Valor hora.
- Observações.

### Badge de status

**Tokens base**

- Tipografia: `text-xs` + `font-medium`
- Padding: `space-2` horizontal e `space-1` vertical
- Radius: `radius-full`

**Variações**

- Sucesso: fundo derivado de `status-success`, texto `text-on-dark` ou `text-primary` conforme contraste.
- Atenção: fundo derivado de `status-warning`, texto `text-primary`.
- Erro: fundo derivado de `status-error`, texto `text-on-dark`.

**Uso ideal**

- “Cálculo validado”.
- “Intervalo abaixo do mínimo”.
- “Overtime ativo”.
- “Registro incompleto”.

### Lista de resumo semanal

**Estrutura**

Cada linha da lista deve exibir período, total de horas, overtime e valor bruto parcial, usando separação por `border-subtle` e espaçamento vertical `space-4`.

**Hierarquia**

- Dia/semana: `text-base` + `font-semibold`
- Metadados: `text-sm` + `font-normal`
- Valor principal: `text-lg` + `font-semibold`

## Estados obrigatórios

Todo componente interativo deve seguir este padrão:

| Estado | Regra |
|---|---|
| Default | Aparência base do componente |
| Hover | Feedback visual discreto e imediato |
| Active/Pressed | Reforço de clique/toque; Apple recomenda estado de pressão em botões customizados.[web:13] |
| Focus | Ring visível com `border-focus` para navegação por teclado e acessibilidade.[web:1][web:9] |
| Disabled | Opacidade reduzida, texto menos proeminente e cursor `not-allowed` |

## Padrões por tela

### Tela de registro diário

Estrutura sugerida:

1. Cabeçalho com data e status do turno.
2. Card principal com inputs de entrada, intervalo e saída.
3. Card de cálculo automático com total do dia.
4. Ações fixas no rodapé em mobile: Primary e Secondary.

**Tokens principais**

- Fundo geral: `surface-page`
- Cards: `surface-card`
- Inputs: `surface-card` + `border-default`
- CTA principal: `action-primary`

### Tela de resumo semanal

Estrutura sugerida:

1. Título da semana.
2. Card de KPI com horas totais.
3. Card de overtime.
4. Card de pagamento bruto.
5. Lista por dia com detalhes expansíveis.

**Tokens principais**

- Valores de destaque: `text-primary`
- Apoio e datas: `text-secondary`
- Destaques leves: `surface-subtle`
- Fechamento semanal: `action-strong`

### Tela de inconsistências

Estrutura sugerida:

1. Lista de registros com problema.
2. Badge de status em cada item.
3. CTA secundário para editar e CTA principal para recalcular.

**Tokens principais**

- Aviso: `status-warning`
- Erro crítico: `status-error`
- Mensagem de ajuda: `text-secondary`

## Exemplo de uso

### Exemplo 1 — Card de horas do dia

- Container: `surface-card`, `radius-xl`, `shadow-card`, `space-6`
- Título “Hoje”: `text-2xl`, `font-semibold`, `text-primary`
- Texto auxiliar: `text-sm`, `text-secondary`
- Total trabalhado: `text-4xl`, `font-bold`, `text-primary`
- Badge “Overtime ativo”: `text-xs`, `font-medium`, cor de status apropriada
- Botão “Salvar registro”: `action-primary`, `text-on-brand`, `radius-md`

### Exemplo 2 — Campo de horário

- Label: `text-sm`, `font-medium`, `text-secondary`
- Input: `surface-card`, `border-default`, `radius-sm`, `space-4`
- Placeholder: `text-muted`
- Focus: ring `border-focus`
- Mensagem de erro, se houver: `text-sm` com `status-error`

### Exemplo 3 — Bloco de fechamento semanal

- Fundo: `surface-card`
- Título: `text-3xl`, `font-semibold`, `text-primary`
- Valor bruto: `text-5xl`, `font-bold`, `text-primary`
- Descrição: `text-base`, `text-secondary`
- Botão de fechamento: `action-strong`, `text-on-dark`, `radius-md`

## Diretrizes responsivas

- Mobile primeiro com uma coluna principal e ações acessíveis com o polegar.[web:10]
- Em mobile, empilhar cards e manter CTAs principais visíveis no rodapé ou logo após o conteúdo crítico.
- Em tablet e desktop, usar duas colunas apenas quando isso não prejudicar a leitura sequencial do cálculo.
- Tabelas de resumo devem virar lista de cards em telas menores.

## Regras finais de implementação

- Nunca substituir tokens por valores arbitrários fora desta especificação.
- Mesmo componente deve manter os mesmos tokens em todo o app.
- Cores de status devem comunicar estado funcional, não decoração.[web:1][web:8]
- Estados de foco, clique e desabilitado são obrigatórios em todos os componentes interativos.[web:1][web:9][web:13]
- Números críticos de jornada e pagamento devem usar sempre `text-primary` e peso semântico alto.

## Próximos componentes recomendados

Para a próxima versão do design system, vale documentar também:

- Tabs para alternar Dia, Semana e Configurações.
- Bottom action bar mobile.
- Modal de ajuste manual.
- Accordion para detalhamento por dia.
- Tabela responsiva de histórico.
- Toast de sucesso e erro.
