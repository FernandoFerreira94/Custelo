# IA / OCR — constraints deste produto

Custelo nao e um produto de agente/LLM generico. IA aparece no **OCR da
etiqueta** e no matching. Gate 10 do Dev Hub aplica so nesse caminho.

- Porta `LabelExtractor`. Dominio nao importa SDK do fornecedor.
- OCR de **texto**, matching deterministico local (ADR-014). Unidade/endereco
  e o filtro primario; nome e o segundo sinal.
- Timeout ~4s, 1 retry, fallback manual sempre alcancavel.
- IA **sugere**; humano confirma. Nenhuma pessoa e cadastrada sozinha.
- Nunca logar imagem da etiqueta nem texto bruto de OCR.
- Saida do modelo nao e prova de identidade, permissao ou estado de custodia.
- Fornecedor de OCR ainda e OPEN QUESTION — nao congelar no codigo; a porta
  ja existe.
