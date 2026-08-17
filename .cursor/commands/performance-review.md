---
description: Gate 2 (Performance) contra o diff atual ou um modulo nomeado
---

Rode o Gate 2 (Performance) dos Quality Gates contra o diff atual ou o modulo
indicado em `$ARGUMENTS`.

**Banco**

- query dentro de laco (use `inArray`)
- select sem projecao de colunas
- join/relacao carregada sem motivo
- endpoint de lista sem paginacao
- filtro em coluna nao indexada — sugerir indice
- escrita multipla fora de transacao
- policy RLS pagando custo por indice que nao lidera por `empreendimento_id`

**Frontend**

- `useEffect` + `fetch` para dado de servidor (deve ser TanStack Query)
- rota que busca dado sem limite de Suspense/skeleton
- dependencias de `useEffect`/`useMemo` causando re-render evitavel
- imagem sem `next/image` com `width`/`height`
- componente pesado sem `dynamic()`
- `"use client"` em componente que nao interage

**OPS (PWA) — criterio proprio**

O alvo e Android de baixo custo. Avalie custo de renderizacao na fila e na tela
de captura, tamanho do bundle do route group `(ops)` e qualquer efeito visual
caro. Blur e superficie translucida sao proibidos justamente por isso.

Saida: tabela `[arquivo | problema | impacto | correcao]`. Somente achados.
