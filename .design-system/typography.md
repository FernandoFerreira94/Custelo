# Tipografia

## Produto

**Inter**, carregada via `next/font/google` em `src/app/layout.tsx` e exposta
como `--font-sans`.

| Peso | Uso                                       |
| ---- | ----------------------------------------- |
| 400  | texto e descricoes                        |
| 500  | labels e controles                        |
| 600  | titulos, **numeros operacionais** e acoes |
| 700  | destaques pontuais                        |

## Marca

O wordmark "Custelo" usa a direcao serifada aprovada no conceito visual.
E **arte de marca**, nao texto de interface. Nao reproduzir com fonte de
sistema.

Confirmacao da fonte serifada e da licenca continua pendente com o cliente.

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
