import * as React from "react"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode (foco em ERP/SaaS): densidade ligada ao token `--wc-density-row` do tema
// (compacta = linha − 8px, confortável = linha + 12px), cabeçalho fixo com rolagem no container,
// coluna numérica (tabular-nums + alinhada à direita), linha selecionada com acento do tema,
// zebra (`striped`), linhas de grade (`bordered`), coluna fixa (`pin`) e container com
// contain: inline-size (tabela larga rola dentro dele e não alarga grid/flex pai).
function Table({
  className,
  density = "default",
  stickyHeader = false,
  striped = false,
  bordered = false,
  containerClassName,
  containerRef,
  ...props
}: React.ComponentProps<"table"> & {
  /** Altura da linha relativa ao token `density.row` do tema. */
  density?: "compact" | "default" | "comfortable"
  /** Fixa o cabeçalho; dê altura máxima ao container (containerClassName="max-h-96"). */
  stickyHeader?: boolean
  /** Zebra: fundo alternado nas linhas do corpo (tabelas largas, leitura em linha). */
  striped?: boolean
  /** Linhas verticais entre colunas (planilha, comparação). */
  bordered?: boolean
  containerClassName?: string
  /** Ref do container que rola (DataTable virtual lê o scroll dele). */
  containerRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      data-density={density}
      className={cn(
        "relative w-full overflow-x-auto contain-inline-size",
        // Fallback 40px: projeto com tema anterior ao ADR 0012 continua com a mesma altura.
        "[--wc-table-row:var(--wc-density-row,40px)] [--wc-table-head:var(--wc-density-row,40px)]",
        "data-[density=compact]:[--wc-table-row:calc(var(--wc-density-row,40px)_-_8px)] data-[density=compact]:[--wc-table-head:calc(var(--wc-density-row,40px)_-_8px)]",
        "data-[density=comfortable]:[--wc-table-row:calc(var(--wc-density-row,40px)_+_12px)] data-[density=comfortable]:[--wc-table-head:calc(var(--wc-density-row,40px)_+_8px)]",
        // Foco por Tab rola o container sem esconder a linha atrás do cabeçalho fixo.
        stickyHeader && "scroll-pt-(--wc-table-head) overflow-y-auto",
        containerClassName
      )}
    >
      <table
        data-slot="table"
        data-density={density}
        data-sticky-header={stickyHeader || undefined}
        data-striped={striped || undefined}
        data-bordered={bordered || undefined}
        className={cn(
          "group/table w-full caption-bottom text-sm tabular-nums",
          "data-[bordered]:[&_:is(td,th)+:is(td,th)]:border-l",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b group-data-[sticky-header]/table:sticky group-data-[sticky-header]/table:top-0 group-data-[sticky-header]/table:z-10 group-data-[sticky-header]/table:bg-card group-data-[sticky-header]/table:shadow-[inset_0_-1px_0_var(--border)]",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        className
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // O tom da linha vive em --wc-row-tint: a linha pinta com ele e as colunas fixas o sobrepõem ao card.
        "group/row border-b bg-(--wc-row-tint) transition-colors duration-(--wc-motion-duration-instant) [--wc-row-tint:transparent]",
        "group-data-[striped]/table:even:[--wc-row-tint:color-mix(in_oklab,var(--muted)_40%,transparent)]",
        "hover:[--wc-row-tint:color-mix(in_oklab,var(--muted)_60%,transparent)]! has-aria-expanded:[--wc-row-tint:color-mix(in_oklab,var(--muted)_60%,transparent)]!",
        "data-[state=selected]:[--wc-row-tint:color-mix(in_oklab,var(--accent)_70%,transparent)]!",
        className
      )}
      {...props}
    />
  )
}

const CELL =
  "px-3 align-middle whitespace-nowrap group-data-[density=compact]/table:px-2 group-data-[density=comfortable]/table:px-4 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"

// Coluna fixa: fundo opaco (card) com o tom da linha por cima (zebra, hover, selecionada); a sombra marca a borda.
const PIN = {
  start: "sticky z-[1] bg-card shadow-[inset_-1px_0_0_var(--border)]",
  end: "sticky right-0 z-[1] bg-card shadow-[inset_1px_0_0_var(--border)]",
}
const PIN_TINT = "bg-[image:linear-gradient(var(--wc-row-tint),var(--wc-row-tint))]"

type CellExtras = {
  numeric?: boolean
  /** Fixa a célula ao rolar na horizontal. Em `start`, ajuste `left-*` se houver outra coluna fixa antes. */
  pin?: "start" | "end"
}

function TableHead({ className, numeric = false, pin, ...props }: React.ComponentProps<"th"> & CellExtras) {
  return (
    <th
      data-slot="table-head"
      data-numeric={numeric || undefined}
      data-pin={pin}
      className={cn(
        "h-(--wc-table-head) text-left text-xs font-medium tracking-wide text-muted-foreground data-[numeric]:text-right",
        CELL,
        pin && PIN[pin],
        pin === "start" && "left-0",
        pin && "z-[2]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  numeric = false,
  pin,
  rowHeader = false,
  ...props
}: React.ComponentProps<"td"> &
  CellExtras & {
    /** Célula que identifica a linha: vira `<th scope="row">` com o mesmo estilo. */
    rowHeader?: boolean
  }) {
  const Comp = (rowHeader ? "th" : "td") as "td"
  return (
    <Comp
      data-slot="table-cell"
      data-numeric={numeric || undefined}
      data-pin={pin}
      {...(rowHeader && { scope: "row" })}
      className={cn(
        "h-(--wc-table-row) py-2 group-data-[density=compact]/table:py-1 group-data-[density=comfortable]/table:py-3 data-[numeric]:text-right",
        rowHeader && "text-left font-medium",
        CELL,
        pin && [PIN[pin], PIN_TINT],
        pin === "start" && "left-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
