import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const ICON_SIZES = {
  sm: { width: 40, height: 48, className: "h-10 w-auto" },
  md: { width: 56, height: 68, className: "h-14 w-auto" },
  lg: { width: 72, height: 88, className: "h-[4.5rem] w-auto" },
  xl: { width: 88, height: 106, className: "h-20 w-auto sm:h-[5.5rem]" },
} as const;

type IconSize = keyof typeof ICON_SIZES;

type PacoteZapMarkProps = {
  showIcon?: boolean;
  iconSize?: IconSize;
  variant?: "default" | "onPrimary";
  layout?: "horizontal" | "vertical";
  className?: string;
  textClassName?: string;
} & ComponentPropsWithoutRef<"div">;

export function PacoteZapMark({
  showIcon = false,
  iconSize = "md",
  variant = "default",
  layout = "horizontal",
  className,
  textClassName,
  ...props
}: PacoteZapMarkProps) {
  const icon = ICON_SIZES[iconSize];
  const pacoteClass =
    variant === "onPrimary" ? "text-primary-foreground" : "text-primary";
  const zapClass =
    variant === "onPrimary" ? "text-secondary" : "text-secondary";

  return (
    <div
      {...props}
      className={cn(
        "flex items-center",
        layout === "vertical" ? "flex-col gap-3" : "gap-3",
        className,
      )}
    >
      {showIcon ? (
        <Image
          src="/brand/logo-icon.png"
          alt=""
          width={icon.width}
          height={icon.height}
          priority={variant === "onPrimary"}
          className={icon.className}
        />
      ) : null}
      <p
        className={cn(
          "font-sans text-2xl font-semibold tracking-tight sm:text-3xl",
          textClassName,
        )}
      >
        <span className={pacoteClass}>Pacote</span>
        <span className={cn("font-brand font-semibold", zapClass)}>Zap</span>
      </p>
    </div>
  );
}

export function PacoteZapMobileHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <PacoteZapMark
      {...props}
      showIcon={false}
      layout="vertical"
      className={cn("mb-4 lg:hidden", className)}
      textClassName="text-xl"
    />
  );
}
