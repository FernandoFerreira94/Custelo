# api

Route Handlers sao adaptadores: validam e chamam caso de uso. Sem regra.

| Rota           | Por que e publica                                       | Fase |
| -------------- | ------------------------------------------------------- | ---- |
| `/api/health`  | load balancer / uptime; sem sessao e sem PII            | I1   |
| `/api/inngest` | Inngest Cloud assina o request; nao e sessao de usuario | I1   |

Auth Hook / sessao: **I2**. Webhook WhatsApp: **I7**. Upload assinado: **I5**.
