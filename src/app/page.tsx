/**
 * Placeholder da raiz.
 *
 * Nao e uma pagina de produto. Existe para o app subir durante a preparacao.
 * Sera substituida pelo redirecionamento por superficie na fase I2, quando o
 * contexto autenticado passar a existir.
 */
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">Custelo</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Recebimento e cadeia de custódia para portarias e operações prediais.
      </p>
      <p className="text-xs text-muted-foreground">
        Ambiente preparado — implementação ainda não iniciada.
      </p>
    </main>
  );
}
