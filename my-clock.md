a# META PROMPT — MY CLOCK

Crie uma aplicação profissional chamada **My Clock**, desenvolvida com **Next.js (App Router)**, **TypeScript**, **TailwindCSS**, **shadcn/ui**, arquitetura escalável e preparada para evolução futura como SaaS.

O objetivo do sistema é permitir que funcionários de fábrica controlem suas horas trabalhadas, acompanhem overtime corretamente, calculem pagamento bruto semanal e gerem relatórios em PDF para conferência e solicitação de correções de pagamento.

O sistema deve funcionar inicialmente com **armazenamento local (IndexedDB)**, sem login obrigatório, porém a arquitetura deve ser preparada desde o início para futura migração para autenticação e banco em nuvem como **Supabase + PostgreSQL**, sem necessidade de refatoração completa.

O projeto deve seguir boas práticas reais de produto, não apenas projeto de portfólio.

---

# STACK OBRIGATÓRIA

Utilizar:

- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- Zustand (ou Context API bem estruturada)
- IndexedDB (preferencialmente via Dexie.js)
- jsPDF ou pdf-lib para exportação PDF
- next-intl para i18n
- ESLint + Prettier

O projeto deve ser preparado para um futuro Design System próprio.

Não usar código improvisado, acoplado ou arquitetura fraca.

Sempre que possível, utilizar componentes prontos e padrões do shadcn/ui.

---

# OBJETIVO DO APP

Permitir que vários funcionários utilizem o sistema individualmente para:

- registrar horas trabalhadas
- controlar overtime corretamente
- calcular salário bruto semanal
- visualizar histórico
- emitir relatório PDF individual
- manter backup local seguro
- exportar dados

O foco principal é evitar perda de pagamento por erro de folha.

---

# NOME DO APP

## My Clock

---

# REGRAS DE NEGÓCIO (OBRIGATÓRIAS)

---

# 1. HORÁRIO DE INÍCIO DO TURNO

Não utilizar turno fixo como manhã/noite.

Cada funcionário terá o campo:

## Horário de início do turno

Exemplos:

- 04:00
- 07:30
- 13:00
- 16:00

Esse horário será usado como base para cálculo.

---

# 2. REGRA DE ENTRADA (CLOCK-IN)

A jornada começa a contar a partir de:

## horário de início do turno OU horário real de entrada

## o que for mais tarde

### Exemplo

Horário de início do turno: 07:30

- entrou 07:10 → conta 07:30
- entrou 07:25 → conta 07:30
- entrou 07:30 → conta 07:30
- entrou 07:40 → conta 07:40

### Regra

- chegar antes NÃO gera pagamento extra
- chegar atrasado reduz horas pagas

---

# 3. REGRA DE SAÍDA (CLOCK-OUT)

No final:

## cada minuto até o horário real de saída é contado

Não existe arredondamento na saída.

### Exemplo

- saiu 00:03 → conta até 00:03
- saiu 00:17 → conta até 00:17

---

# 4. INTERVALO NÃO REMUNERADO

O desconto será:

## 30 minutos OU o tempo real do intervalo

## o que for maior

### Exemplo

- 20 min → desconta 30
- 30 min → desconta 30
- 35 min → desconta 35
- 50 min → desconta 50

Nunca descontar menos de 30 minutos.

---

# 5. OVERTIME (CÁLCULO SEMANAL)

O overtime NÃO é diário.

Ele é calculado por semana.

A base principal considera:

## Segunda a Sexta

Após completar:

## 39 horas trabalhadas

começa o overtime.

---

# OVERTIME A

Após 39 horas:

as próximas:

## 4 horas

serão pagas como:

## Overtime A = 1.5x

Total acumulado:

## até 43 horas

---

# OVERTIME B

Tudo que ultrapassar:

## 43 horas semanais

será pago como:

## Overtime B = 2.0x

---

# SÁBADO

Entra como continuação da semana.

Dependendo do acumulado:

- pode entrar como Overtime A
- pode entrar como Overtime B

Se já passou de 43h:

todo sábado tende a ser:

## Overtime B (2.0x)

---

# DOMINGO

Todas as horas:

## Overtime B (2.0x)

desde o primeiro minuto.

---

# DADOS DO FUNCIONÁRIO

Cada usuário deve possuir:

- nome completo
- employee number (número do ponto)
- horário de início do turno
- valor da hora trabalhada
- idioma preferido
- moeda preferida

A moeda padrão inicial será:

## EURO (€)

Toda lógica financeira e relatórios devem utilizar EUR como padrão.

Preparar estrutura futura para:

- employeeId
- userId
- companyId

mesmo que inicialmente sejam opcionais.

---

# REGISTRO SEMANAL

Cada semana deve permitir:

Para cada dia:

- data
- horário de entrada
- saída para intervalo
- retorno do intervalo
- horário de saída

O sistema deve calcular automaticamente:

- horas do dia
- horas normais
- overtime A
- overtime B
- valor bruto diário

E também:

- total semanal
- total bruto semanal

---

# FUNCIONALIDADES OBRIGATÓRIAS

## Dashboard principal

Com:

- resumo semanal
- horas acumuladas
- overtime A
- overtime B
- valor bruto previsto

---

## Cadastro do funcionário

---

## Registro semanal de horas

Interface simples e rápida para uso real em fábrica.

Mobile-first obrigatório.

---

## Histórico de semanas

---

## Exportação PDF

Relatório individual contendo:

- dados do funcionário
- período selecionado
- horas por dia
- total semanal
- overtime A
- overtime B
- valor bruto total

Filtros:

- por semana
- por mês
- por data inicial/final

---

## Exportação CSV

---

## Backup local (.json)

---

## Importação de backup

---

# i18n (OBRIGATÓRIO)

Implementar com next-intl.

Preparar para os seguintes idiomas:

- Português: Português
- Irlandês: Gaeilge
- Inglês: English
- Lituano: Lietuvių
- Russo: Русский
- Ucraniano: Українська
- Romeno: Română
- Espanhol: Español
- Búlgaro: Български
- Letão: Latviešu
- Urdu: اردو

Não apenas tradução visual.

Também internacionalizar:

- moeda
- datas
- timezone
- formatos numéricos

Toda string deve sair de arquivos de tradução.

Nada hardcoded.

---

# DESIGN SYSTEM

Estruturar o projeto preparado para futuro Design System próprio.

Criar base com:

- tokens
- spacing
- typography
- form patterns
- table patterns
- cards
- badges
- status indicators
- alerts
- modal patterns

Mesmo que simples agora.

Não criar UI desorganizada.

Visual limpo, profissional e escalável.

Priorizar componentes reutilizáveis e padrões do shadcn/ui.

---

# ARQUITETURA OBRIGATÓRIA

Separar corretamente:

## domain

Regras de negócio

## application

Casos de uso

## infrastructure

IndexedDB / futura API

## presentation

UI

## shared

Utils / constants / types

Não misturar cálculo dentro de páginas.

### Exemplo correto

```ts
calculateWeeklyPayroll()