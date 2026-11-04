"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/ui/copy-button"

// Inspirado no Descriptions do Ant Design (MIT; reimplementado). Lista chave → valor para telas de detalhe
// (pedido, cliente, nota fiscal). WebCode: `<dl>` semântico com `<div>` por par, três layouts (horizontal com
// rótulo à esquerda, vertical empilhado e grade de colunas), `bordered` em `bg-card`, `span` para valor largo,
// `copyValue` com CopyButton (CNPJ, chave Pix, ID), vazio vira "—" lido como "Não informado" e, no celular,
// o horizontal empilha sozinho para o valor não ser espremido.
type Layout = "horizontal" | "vertical" | "grid"

const DLContext = React.createContext<{ layout: Layout; bordered: boolean }>({ layout: "horizontal", bordered: false })

function DescriptionList({
  layout = "horizontal",
  columns = 2,
  bordered = false,
  className,
  style,
  ...props
}: React.ComponentProps<"dl"> & {
  layout?: Layout
  /** Colunas da grade a partir de `sm` (layout "grid"). */
  columns?: 1 | 2 | 3 | 4
  bordered?: boolean
}) {
  return (
    <DLContext.Provider value={{ layout, bordered }}>
      <dl
        data-slot="description-list"
        data-layout={layout}
        data-bordered={bordered || undefined}
        className={cn(
          "text-sm",
          layout === "grid" ? "grid grid-cols-1 sm:grid-cols-(--dl-cols)" : "flex flex-col",
          layout === "grid" && (bordered ? "gap-px overflow-hidden rounded-lg border bg-border" : "gap-x-6 gap-y-4"),
          layout !== "grid" && bordered && "divide-y overflow-hidden rounded-lg border bg-card",
          layout === "horizontal" && !bordered && "divide-y",
          layout === "vertical" && !bordered && "gap-4",
          className
        )}
        style={{ "--dl-cols": `repeat(${columns}, minmax(0, 1fr))`, ...style } as React.CSSProperties}
        {...props}
      />
    </DLContext.Provider>
  )
}

function DescriptionItem({
  label,
  hint,
  copyValue,
  span,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  /** Texto auxiliar sob o rótulo (ex.: "Usado na NF-e"). */
  hint?: React.ReactNode
  /** Mostra o botão copiar com este valor. */
  copyValue?: string
  /** Colunas ocupadas na grade (ou "full"). */
  span?: number | "full"
  children?: React.ReactNode
}) {
  const { layout, bordered } = React.useContext(DLContext)
  const empty = children == null || children === "" || children === false
  return (
    <div
      data-slot="description-item"
      className={cn(
        "min-w-0",
        layout === "horizontal" && "grid gap-1 py-3 sm:grid-cols-[minmax(8rem,30%)_minmax(0,1fr)] sm:gap-4",
        layout === "horizontal" && bordered && "px-4",
        layout !== "horizontal" && "flex flex-col gap-1",
        layout !== "horizontal" && bordered && "bg-card px-4 py-3",
        layout === "grid" && span === "full" && "sm:col-span-full",
        layout === "grid" && typeof span === "number" && "sm:[grid-column:var(--dl-span)]",
        className
      )}
      style={typeof span === "number" ? ({ "--dl-span": `span ${span} / span ${span}` } as React.CSSProperties) : undefined}
      {...props}
    >
      <dt className="flex min-w-0 flex-col gap-0.5 font-medium text-muted-foreground">
        <span>{label}</span>
        {hint && <span className="text-xs font-normal">{hint}</span>}
      </dt>
      <dd className="flex min-w-0 items-start gap-1.5 text-foreground">
        {empty ? (
          <span className="text-muted-foreground">
            <span aria-hidden>—</span>
            <span className="sr-only">Não informado</span>
          </span>
        ) : (
          <div className="min-w-0 break-words">{children}</div>
        )}
        {copyValue && !empty && (
          <CopyButton
            value={copyValue}
            variant="ghost"
            size="icon-xs"
            label={`Copiar ${typeof label === "string" ? label : "valor"}`}
            className="-my-0.5 shrink-0 text-muted-foreground"
          />
        )}
      </dd>
    </div>
  )
}

export { DescriptionList, DescriptionItem }
