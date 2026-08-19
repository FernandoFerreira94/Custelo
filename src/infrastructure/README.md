# infrastructure

Unico lugar onde SDK de fornecedor pode ser importado. Implementa as portas de
`src/ports`.

| Pasta            | Porta / papel             | Fase |
| ---------------- | ------------------------- | ---- |
| `clock/`         | `Clock` → `SystemClock`   | I1   |
| `jobs/`          | `JobScheduler` → Inngest  | I1   |
| `observability/` | logger + Sentry (sem PII) | I1   |

`LabelExtractor`, `MessagingProvider` e `EvidenceStorage` nascem em I5/I7.
