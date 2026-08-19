/**
 * Bolas do painel bege. A bola do canto do card vive no wrapper do form.
 */
export function LoginOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block"
    >
      <span className="absolute top-0 right-0 size-[32rem] translate-x-1/2 -translate-y-1/2 rounded-full bg-muted" />
      <span className="absolute bottom-0 left-0 size-[22rem] -translate-x-1/2 translate-y-1/2 rounded-full bg-accent/20" />
    </div>
  );
}
