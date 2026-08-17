# ADRs

Os 20 ADRs do **Architecture Freeze (13/08/2026)** vivem no Notion e estao
resumidos em `docs/architecture/adr-index.md`. Eles sao LOCKED.

Este diretorio existe para o que vier **depois**: toda mudanca de decisao
congelada exige um ADR novo.

## Quando escrever um ADR

- mudar qualquer decisao ADR-001 a ADR-020
- escolher fornecedor onde havia OPEN QUESTION (OCR, billing, regiao de dados)
- acionar uma rota de fuga documentada (Capacitor no lugar da PWA, pgmq no lugar
  do Inngest, R2 no lugar do Supabase Storage, BSP no lugar da Cloud API)
- introduzir dependencia estrutural nova (cache, realtime, fila propria)
- mudar fronteira de camada ou de superficie

## Quando **nao** escrever

Escolha de biblioteca pequena, padrao de codigo, refactor local. Isso vai para
`.claude/memory.md`.

## Formato

`docs/adr/NNN-titulo-curto.md`, numeracao continuando de 021.

```markdown
# ADR-0NN — Titulo

- **Status:** PROPOSTO | ACEITO | SUPERADO por ADR-0MM
- **Data:** AAAA-MM-DD
- **Supera:** ADR-0XX (se aplicavel)

## Problema

O que forcou a decisao. Sem solucao aqui.

## Escolha

A decisao, em uma frase.

## Alternativas

O que mais foi considerado, e por que perdeu.

## Motivo

Por que esta escolha ganhou, no contexto deste produto e de um dev solo.

## Trade-offs

O que estamos aceitando de ruim conscientemente.

## Riscos e mitigacao

O que pode dar errado, e o que fazemos se der.

## Gatilho de revisao

Que evidencia concreta reabriria esta decisao.
```

O campo **Gatilho de revisao** nao e opcional. O ADR-012 (PWA) e o modelo: ele
diz exatamente o que faria o projeto migrar para Capacitor. Decisao sem gatilho
vira dogma.

## Depois de aceitar um ADR

1. Atualize `docs/architecture/adr-index.md`.
2. Atualize o bloco `## Summary` de `.claude/memory.md` se for critico.
3. Registre no Notion, na pagina de Architecture Freeze.
4. Se a decisao muda uma regra de codigo, atualize `.claude/rules/` — que e o que
   o Cursor tambem le.
