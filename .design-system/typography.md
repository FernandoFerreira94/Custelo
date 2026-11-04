# Tipografia

## Produto

**Inter** no corpo (`--font-sans`) e **Plus Jakarta Sans** nos titulos
(`--font-display`, ADR-021), ambas via `next/font/google` em
`src/app/layout.tsx`. Bodoni Moda foi aposentada.

| Peso | Uso                                       |
| ---- | ----------------------------------------- |
| 400  | texto e descricoes                        |
| 500  | labels e controles                        |
| 600  | titulos, **numeros operacionais** e acoes |
| 700  | destaques pontuais                        |

## Marca

O wordmark "PacoteZap" usa Plus Jakarta Sans extra-bold: "Pacote" navy, "Zap"
brasa. Os arquivos da logo sao a referencia; nao recompor o wordmark a mao.

## PrincIpios

- Numeros operacionais precisam de alta legibilidade — sao o dado que o porteiro
  le de relance.
- **Nunca abaixo de 14px** para conteudo operacional regular.
- 12–13px so em label secundario que nao e essencial a execucao da tarefa.
- Evitar excesso de uppercase.
- Hierarquia por **peso, tamanho e espaco** antes de recorrer a cor.

Essa ultima regra existe porque a cor ja carrega significado funcional neste
produto (estados operacionais). Usar cor para hierarquia visual compete com o
sinal que o operador precisa ler.

## Biblioteca

O Penpot tem 11 estilos tipograficos definidos na pagina "00 — Foundations".
Ao criar um estilo novo no codigo, verificar se ele ja existe la.
