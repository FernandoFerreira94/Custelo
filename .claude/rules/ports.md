---
paths: ["src/ports/**", "src/infrastructure/**"]
---

# Portas e adaptadores

`src/infrastructure` e o **unico** lugar onde SDK de fornecedor pode ser
importado. Trocar de fornecedor deve ser alteracao aqui, nunca no dominio.

| Porta               | Regra que o adaptador nao pode quebrar                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LabelExtractor`    | timeout 4s, 1 retry, depois fallback manual sem travar a tela. Nunca logar a imagem nem o texto bruto — apenas campos extraidos e nivel de confianca. |
| `MessagingProvider` | uma mensagem consolidada por unidade. Nunca enviar foto, CPF, telefone, QR ou tracking completo. Falha e estado visivel.                              |
| `EvidenceStorage`   | bucket privado, upload por URL assinada, leitura por URL assinada de curta duracao. Compressao no cliente antes do upload.                            |
| `JobScheduler`      | toda emissao com chave de idempotencia. Espera duravel e primitiva da porta, nao `setTimeout`.                                                        |
| `Clock`             | unica origem de tempo do sistema.                                                                                                                     |

- Adaptador nao decide regra de negocio — traduz.
- Falha de fornecedor vira resultado tipado, nunca excecao solta subindo ate a UI.
- Toda porta tem um fake em `src/tests/` usado pelos testes de dominio.
- Rota de fuga documentada por porta em `src/ports/README.md` — manter atual.
