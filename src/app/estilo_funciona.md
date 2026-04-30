# Identidade Visual: Página Como Funciona (How It Works)

Focada em regras de negócio. Utiliza cards com sombra suave (`shadow-sm`) e cantos padrão (`rounded-lg`) para simular "fichas" de documentação.

## Regras de Cores (Cálculos)
- **Azul (Geral/Entrada/Intervalo):** `bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`
- **Verde (Horas Normais):** `bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800`
- **Vermelho (Atenção/Exemplos):** Títulos com `text-red-600`.

## Mudanças de Conteúdo (Clean Design)
- **Sem divisores manuais:** Removidos todos os `---`.
- **Sem títulos ###:** Removidos para manter a hierarquia limpa.
- **Destaque de Regra:** Regras principais (como a de 39h ou desconto de 30min) são unificadas em um único parágrafo em negrito dentro do card colorido.

## Classes Base
- **Cards de Regra:** `border rounded-lg p-5 my-4 shadow-sm font-bold text-base leading-relaxed`
