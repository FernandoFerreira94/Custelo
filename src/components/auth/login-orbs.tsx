/**
 * Mesma composicao da referencia (painel navy):
 * topo-direita, meio-direita, canto inferior esquerdo.
 * Cores do lado bege. Solidas, sem blur.
 */
export function LoginOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
    >
      <span className="absolute top-0 right-0 size-[32rem] translate-x-1/2 -translate-y-1/2 rounded-full bg-muted" />

      <span className="absolute bottom-0 left-0 size-[22rem] -translate-x-1/2 translate-y-1/2 rounded-full bg-accent/20" />
    </div>
  );
}
