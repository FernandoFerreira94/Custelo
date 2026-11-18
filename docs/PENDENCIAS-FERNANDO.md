# Pendências que só o Fernando resolve

Lista única. O agente segue o plano e, onde a tarefa depende de algo daqui, deixa
stub ou flag e registra a linha. Ao resolver, marque `[x]` e diga onde ficou.

Atualizado em 18/11/2026.

## Decisões (D1 a D19 do plano mestre, seção 1)

O plano segue a recomendação de cada uma até a resposta. O piloto (Task 13.2) exige todas respondidas.

- [ ] Responder D1 a D19 (o agente monta o resumo de cada uma com a recomendação quando chegar na fase que a usa)

## Contas e chaves externas

- [ ] Nuvem de produção (13.1)
- [ ] Meta/WABA e modelos de mensagem aprovados (I7)
- [ ] Conta e chave do provedor de IA para a leitura da etiqueta (D4, I5): `LEITURA_OCR_CHAVE` (Google Cloud Vision) e `LEITURA_LLM_CHAVE` (Gemini). Ao criar, ponha limite de gasto no painel do provedor, confira modelo, preço, região e retenção na doc oficial do dia e preencha `CONFERIDO_EM` em `src/infrastructure/leitura/config.ts`
- [ ] Benchmark D4 com 40 fotos reais do piloto (`docs/benchmarks/leitura-etiqueta.md`). Até lá `LEITURA_ETIQUETA=desligada` e o recebimento é manual
- [ ] Asaas para a cobrança do excedente (D9, 11.11)
- [ ] Canal de suporte (D12)
- [ ] Custo do PITR e do backup dos arquivos (D19)

## Jurídico

- [ ] Prazos de guarda e devolução (D17)
- [ ] Termos de uso, política de privacidade, DPA e subprocessadores
- [ ] Papel de controlador e operador

## Pranchas que faltam

- [ ] Opt-in do contato (stop-ship)
- [ ] Pedido do titular, LGPD (stop-ship)
- [ ] Termos e aceite (stop-ship)
- [ ] Telas de gestão de contratos da prestadora (IP.4)

## Banco de produção (Supabase PacoteZap-SP)

Toda migration nova é conferida antes de aplicar (roda e passa nos testes no
banco local). Conferido em 18/11 no remoto:

- [x] 0013 e 0014 (fase IP, PR #33): tabelas presentes
- [x] 0015 (I4 custódia, PR #35): aplicada em 18/11 às 21:09 UTC

## Itens abertos durante a execução

| Data  | Tarefa   | O que falta                                                                                                                                                                                   | Onde ficou o stub   |
| ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 18/11 | 4.4      | Revisar: `travarEncomenda` sem `FOR UPDATE` (trava no trigger)                                                                                                                                | PR #36              |
| 18/11 | 4.5–4.8  | Rodar os e2e `tests/e2e/prateleiras.spec.ts` e `custodia.spec.ts` (precisam de `E2E_DATABASE_URL`; a 0015 já está no remoto) e conferir logado `/gestao/estrutura/areas`, `/fila` e o detalhe | escrito, não rodado |
| 18/11 | UX 12/11 | Conferir logado, em 390 px e 1440 px, a nova barra inferior da gestão, o trilho com rótulos, Unidades em cartões e Papéis um por vez (eu não entro com senha no Supabase remoto)              | PR do lote UX       |
