"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Base shadcn/ui (MIT). WebCode: mesmos estados do Input (hover, foco, erro); cresce com o conteúdo (field-sizing);
// `showCount` com `maxLength` mostra "120/500" e avisa (cor de perigo + aria-live) quando passa de 90%.
function Textarea({
  className,
  showCount = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...props
}: React.ComponentProps<"textarea"> & {
  /** Contador "usados/limite" embaixo à direita (precisa de maxLength). */
  showCount?: boolean
}) {
  const [len, setLen] = React.useState(() => String(value ?? defaultValue ?? "").length)
  React.useEffect(() => {
    if (value !== undefined) setLen(String(value).length)
  }, [value])
  const field = (
    <textarea
      data-slot="textarea"
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        setLen(e.target.value.length)
        onChange?.(e)
      }}
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border border-input contrast-more:border-control-border bg-card px-3 py-2 text-base shadow-wc-xs outline-none focus-visible:outline-hidden md:text-sm",
        "transition-[color,border-color,box-shadow] duration-(--wc-motion-duration-fast) ease-wc-out",
        "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        "enabled:hover:not-focus-visible:not-aria-invalid:border-[color-mix(in_oklab,var(--input),var(--foreground)_35%)]",
        "focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
  if (!showCount || !maxLength) return field
  const near = len >= maxLength * 0.9
  return (
    <div data-slot="textarea-field" className="grid gap-1">
      {field}
      <p
        data-slot="textarea-count"
        aria-live={near ? "polite" : "off"}
        className={cn("text-right text-xs tabular-nums", near ? "text-danger" : "text-muted-foreground")}
      >
        {len}/{maxLength}
        {near && <span className="sr-only"> caracteres, perto do limite</span>}
      </p>
    </div>
  )
}

export { Textarea }
