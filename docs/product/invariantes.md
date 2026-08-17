# Invariantes, estados e excecoes

Fonte: Notion, _Contexto Inicial Validado — 13/08/2026_ (precedencia maxima).
Decisoes `DEFINED` aqui **nao sao reabertas** por pesquisa, template ou
inferencia.

## Invariantes

Violar qualquer uma e um bug de produto, nao uma escolha de implementacao.

1. Toda encomenda pertence a **exatamente um** empreendimento e tem uma unidade
   destino, ou esta explicitamente em `NAO_IDENTIFICADA`.
2. Eventos de cadeia de custodia sao **imutaveis**: correcao gera novo evento e
   preserva valor anterior, valor novo, operador, data/hora, motivo, origem
   (online/offline) e efeito sobre notificacoes.
3. **Nao existe hard delete de evidencia operacional** em nenhuma superficie ou
   papel.
4. Nenhuma pessoa e cadastrada automaticamente a partir de OCR/IA; toda criacao
   de vinculo passa por **confirmacao humana**.
5. No matching, **unidade/endereco e filtro primario** e o nome e o segundo
   sinal.
6. QR Code e apenas **locator opaco**: nunca autoriza retirada e nunca reativa
   encomenda ja retirada.
7. Toda retirada tem nome, assinatura, operador, data/hora e **lista explicita**
   de encomendas.
8. Toda notificacao possui status persistido; **falha e estado visivel, nunca
   silencio**.
9. A foto da etiqueta permanece **privada** e nao e enviada por WhatsApp no MVP;
   notificacoes usam apenas o texto minimo necessario.
10. Autorizacao e sempre **server-side e tenant-scoped**; o tenant deriva do
    contexto autenticado e **nunca** de id informado pelo cliente.
11. Falta de internet, falha de OCR/IA ou indisponibilidade do WhatsApp **nunca**
    bloqueiam o recebimento fisico.
12. Correcao apos notificacao **nunca revela** ao contato incorreto quem e o
    destinatario correto.
13. Estado de incerteza e modelado explicitamente: timeout de envio nunca vira
    sucesso nem falha sem autoridade suficiente.

## Maquinas de estado

### Encomenda

`RECEBIDA · IDENTIFICADA · NAO_IDENTIFICADA · AGUARDANDO_NOTIFICACAO ·
NOTIFICADA · FALHA_NOTIFICACAO · RETIRADA · DEVOLVIDA · CANCELADA`

`URGENTE` e `AGING` sao **derivados por regra de tempo**, nao persistidos.

**Proibido:** `RETIRADA` → ativo · `DEVOLVIDA` → ativo · `CANCELADA` → ativo ·
reativacao por leitura de QR · exclusao em qualquer estado.

**Autoridade:** operador confirma identificacao e retirada; permissao elevada
para correcoes criticas; o sistema apenas agenda/envia notificacao e deriva
aging.

### Notificacao

`AGENDADA · ENVIADA · STATUS_PROVIDER · FALHOU · CANCELADA_POR_CORRECAO`

**Proibido:** falha convertida silenciosamente em sucesso · reenvio sem registro.

### Contato (telefone)

`VALIDO · FALHA · PRECISA_CONFIRMACAO`

**Proibido:** contato em falha usado indefinidamente sem alerta.

### Vinculo Pessoa ↔ Unidade

`ATIVO · ENCERRADO`

**Proibido:** vinculo encerrado continuar recebendo notificacao.

### Registro offline

`LOCAL · SINCRONIZANDO · SINCRONIZADO · CONFLITO`

**Proibido:** sincronizacao sobrescrever ou apagar evidencia.

## Acoes de permissao elevada

Restritas a Gestor do Empreendimento e Administrador da Organizacao. Sempre
auditaveis, sempre com motivo, nunca apagando o evento original:

- trocar unidade/destinatario apos notificacao
- cancelar registro
- alterar registro apos a retirada
- corrigir retirada ou devolucao
- enviar notificacao fora da janela

Recepcionista/Porteiro nao executa nenhuma delas. Isso e testado, nao presumido.

## Limites de produto

- Portaria **nao abre** encomendas; o SaaS nao manuseia conteudo (contexto da Lei
  Postal 6.538/1978).
- Assinatura touchscreen e **evidencia operacional** — nao deve ser
  comercializada como assinatura eletronica qualificada.
- Nenhum dado de cartao e armazenado pela plataforma.
