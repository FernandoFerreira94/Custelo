<!--
Preencha tudo em pt-BR. Item que não se aplica: escreva "não se aplica" e o motivo. Não apague seções.
-->

## O que muda

<!-- 1 a 3 linhas: o que este PR faz e por quê. -->

## Pedido original (literal)

<!-- Cole o pedido como foi escrito (task, issue ou mensagem), sem resumir. O checklist de aceite sai daqui. -->

>

## Modelo

<!-- Obrigatório. Esforço é sempre medium; outro nível só com autorização prévia do Fernando (cite onde está). -->

Modelo: <haiku | sonnet | opus | opusplan | Cursor Auto> / esforço medium / subiu: <não | falhou 1x | multi-módulo | risco alto>
Canal: <Claude Code no box | Claude Code na nuvem | Cursor Auto>

## Mapa de features

<!-- Cite o mapa do repo (docs/feature-map.md ou o equivalente declarado no AGENTS.md). -->

- [ ] Mapa citado: `<arquivo>#<feature>`
- [ ] Criou, renomeou ou removeu rota/tela/fluxo? Mapa atualizado neste PR (ou: "não mudou rota")

## Checklist de aceite (tirado do pedido literal)

<!-- Um item por exigência do pedido, com as palavras do pedido. Cada item aponta a evidência (teste, print, saída de comando). -->

- [ ] <exigência 1 do pedido> → evidência:
- [ ] <exigência 2 do pedido> → evidência:

## Testes e evidências

<!-- Comandos rodados e resultado (números), não "funcionou". O que não deu para testar: escreva NÃO VERIFICADO e o motivo. -->

- Build / typecheck / lint:
- Testes (unitário, integração, e2e):
- UI: screenshot comparado ao board aprovado (se for tela):
- Revisão de segurança (Sentinela ou equivalente do repo):
- [ ] Só dados fictícios nos testes (nenhum dado real, nenhum CPF real)
- [ ] Componentes, tokens e ícones reaproveitados (nada recriado)
- [ ] `.ai/memory.md` **não** foi editado neste PR (só na main, depois do merge)
- [ ] Nenhuma skill de fora do repo copiada para `.claude/`

## Antes do merge (não marque pelo Fernando)

- [ ] **CI verde** em todos os checks obrigatórios. Check vermelho, pendente, pulado ou sem minutos bloqueia o merge.
- [ ] PR continua em rascunho até o OK do Fernando. Sem auto-merge.
- [ ] Toca migration, deploy, secrets/`.env`, auth/RLS ou visibilidade do repo? Diga qual e aguarde o OK explícito do Fernando.
- [ ] OK do Fernando para o merge: <data e onde foi dado>
