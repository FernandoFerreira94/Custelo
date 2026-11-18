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
- [ ] Conta e chave do provedor de IA para a leitura da etiqueta (D4, I5)
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

Nenhuma migration é aplicada em produção sem o seu OK escrito na thread. Todas já
rodam e passam nos testes no banco local.

- [ ] 0013 e 0014 (fase IP, PR #33)
- [ ] 0015 (I4 custódia, PR #35)

## Itens abertos durante a execução

| Data  | Tarefa | O que falta                                                                                                                     | Onde ficou o stub   |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 18/11 | 4.4    | Revisar: `travarEncomenda` sem `FOR UPDATE` (trava no trigger)                                                                  | PR #36              |
| 18/11 | 4.5    | Rodar o e2e `tests/e2e/prateleiras.spec.ts` e a revisão visual de `/gestao/estrutura/areas` depois que a 0015 estiver no remoto | escrito, não rodado |
