# retirada

Retirada 1:N, assinatura, comprovante e sugestao de cadastro. Modulo 08.
A wave de maior risco juridico do produto: aqui se prova quem retirou.

## Fluxo F4

Operador seleciona **uma ou varias** encomendas da unidade → nome de quem
recebeu → assinatura digital → operador, data/hora e lista explicita.

Uma assinatura pode cobrir varias encomendas da mesma retirada.

## Invariantes

> Toda retirada tem nome + assinatura + operador + data/hora + lista explicita.
> QR **nunca** autoriza retirada.
> Encomenda retirada **nunca** volta a estado ativo.

## Regras

- PIN nao e obrigatorio no MVP.
- Se a pessoa nao estiver cadastrada e o vinculo for confirmado, o sistema
  **sugere** cadastro — nunca cria automaticamente.
- A retirada precisa funcionar com item **ainda nao sincronizado**. Por isso I8
  vem depois de I6.
- Corrigir uma retirada e acao de permissao elevada e gera evento novo; nunca
  reescreve o original.

## Limite juridico

Assinatura em touchscreen e **evidencia operacional**. Nao deve ser
comercializada como assinatura eletronica qualificada.

## Testes obrigatorios

Retirada concorrente do mesmo volume. Retirada de item nao sincronizado.

## Telas

RET-001 a RET-006. Fase I8.
