# Zod

- Um schema por conceito, definido uma vez e compartilhado entre cliente, Server
  Action e dominio. Schema duplicado diverge — e diverge no campo que importa.
- Tipos derivam do schema (`z.infer`), nunca declarados em paralelo.
- Sem `.passthrough()` em entrada externa: campo nao declarado nao entra.
- Mensagem de erro em portugues, voltada ao operador — quem le e o porteiro no
  meio do pico, nao o desenvolvedor.
- Coercao explicita. Nunca confiar em conversao implicita de query string.
- Identificador de encomenda gerado no cliente e UUIDv7 e valida como tal.
- Telefone, unidade e tracking normalizam **antes** de validar, nao depois.
