"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { glass, type Material } from "@/lib/glass";

// Base shadcn/ui (MIT). WebCode: borda com 3:1 (WCAG 1.4.11), altura 40px, 16px no mobile (iOS não dá zoom),
// hover escurece a borda (mistura com o texto, funciona nos 6 temas), foco = borda na cor de foco + halo suave,
// `size` sm/default/lg pela densidade do tema, InputPassword com mostrar/ocultar (aria-pressed).
// `showCount` + `maxLength`: contador como no Textarea.
// `material="glass"` (ADR 0022): campo em vidro espesso para formulário sobre foto (login com imagem, busca no hero).
const SIZES = {
  sm: "h-(--wc-density-control-sm) px-2.5 md:text-xs",
  default: "h-(--wc-density-control-md) px-3",
  lg: "h-(--wc-density-control-lg) px-4 md:text-base",
} as const;

function Input({
  className,
  type,
  size = "default",
  material = "solid",
  showCount = false,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & {
  size?: keyof typeof SIZES;
  /** `glass`: vidro espesso (texto e placeholder legíveis sobre qualquer fundo). */
  material?: Material;
  /** Contador "usados/limite" embaixo à direita (precisa de maxLength), igual ao do Textarea. */
  showCount?: boolean;
}) {
  const { value, defaultValue, onChange, maxLength } = props;
  const [len, setLen] = React.useState(
    () => String(value ?? defaultValue ?? "").length,
  );
  React.useEffect(() => {
    if (value !== undefined) setLen(String(value).length);
  }, [value]);
  const counted = showCount && !!maxLength;
  const field = (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      data-material={material}
      className={cn(
        "contrast-more:border-control-border shadow-wc-xs w-full min-w-0 rounded-md border border-input bg-card py-1 text-base outline-none focus-visible:outline-hidden md:text-sm",
        material === "glass" &&
          cn(glass("thick"), "border-glass-border shadow-wc"),
        SIZES[size],
        "ease-wc-out transition-[color,border-color,box-shadow] duration-(--wc-motion-duration-fast)",
        "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
        // Arquivo: o botão do navegador vira um botão secundário compacto (o texto ao lado segue o idioma do navegador).
        "file:mr-3 file:inline-flex file:h-7 file:cursor-pointer file:rounded-sm file:border-0 file:bg-secondary file:px-2.5 file:text-sm file:font-medium file:text-secondary-foreground file:transition-colors hover:file:bg-secondary/80 [&[type=file]]:pl-1.5",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "enabled:hover:not-focus-visible:not-aria-invalid:border-[color-mix(in_oklab,var(--input),var(--foreground)_35%)]",
        "focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
      onChange={
        counted
          ? (e) => {
              setLen(e.target.value.length);
              onChange?.(e);
            }
          : onChange
      }
    />
  );
  if (!counted) return field;
  const near = len >= maxLength! * 0.9;
  return (
    <div data-slot="input-field" className="grid gap-1">
      {field}
      <p
        data-slot="input-count"
        aria-live={near ? "polite" : "off"}
        className={cn(
          "text-right text-xs tabular-nums",
          near ? "text-danger" : "text-muted-foreground",
        )}
      >
        {len}/{maxLength}
        {near && <span className="sr-only"> caracteres, perto do limite</span>}
      </p>
    </div>
  );
}

/** Campo de senha com botão mostrar/ocultar (não some ao perder o foco; leitor de tela ouve o estado). */
function InputPassword({
  className,
  size = "default",
  material,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [show, setShow] = React.useState(false);
  return (
    <div data-slot="input-password" className="relative">
      <Input
        type={show ? "text" : "password"}
        size={size}
        material={material}
        autoComplete="current-password"
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        aria-label="Mostrar senha"
        aria-pressed={show}
        onClick={() => setShow((s) => !s)}
        className="absolute top-1/2 right-1 inline-flex size-(--wc-density-control-sm) -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-(--wc-motion-duration-fast) outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-solid"
      >
        {show ? (
          <EyeOffIcon className="size-4" aria-hidden />
        ) : (
          <EyeIcon className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

export { Input, InputPassword };
