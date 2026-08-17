# Portas de abstracao

Definidas no **Architecture Freeze** como obrigatorias.

> Nenhum codigo de dominio importa SDK de fornecedor diretamente.

| Porta               | Isola                       | Implementacao inicial (ADR)                                 | Rota de fuga documentada |
| ------------------- | --------------------------- | ----------------------------------------------------------- | ------------------------ |
| `LabelExtractor`    | OCR / IA da etiqueta        | OCR de texto puro + matching deterministico local (ADR-014) | trocar provedor de visao |
| `MessagingProvider` | WhatsApp                    | WhatsApp Cloud API direta + Embedded Signup (ADR-015)       | BSP (Twilio/360dialog)   |
| `EvidenceStorage`   | fotos e assinaturas         | Supabase Storage, bucket privado, URL assinada (ADR-008)    | Cloudflare R2            |
| `JobScheduler`      | filas, jobs, espera duravel | Inngest (ADR-009)                                           | pgmq + pg_cron           |
| `Clock`             | tempo                       | relogio do sistema                                          | —                        |

`Clock` existe para tornar testavel o que o produto tem de mais dificil de
testar: janela de notificacao, aging e espera duravel.

## Regra de uso

- `src/domain/**` e `src/application/**` importam **apenas** os tipos deste
  diretorio.
- `src/infrastructure/**` implementa as portas e e o unico lugar onde SDK de
  fornecedor pode ser importado.
- Trocar de fornecedor deve ser uma alteracao em `src/infrastructure`, nunca em
  `src/domain`.

As assinaturas concretas de cada porta sao escritas na fase **I1/I5/I7** do
Implementation Roadmap, junto com a primeira implementacao. Este diretorio
existe para que a fronteira seja visivel desde o primeiro commit.
