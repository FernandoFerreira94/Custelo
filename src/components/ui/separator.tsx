"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

// WebCode: `children` vira rótulo no meio da linha ("ou", "Hoje") e `variant="dashed"` para divisões leves.
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant = "solid",
  children,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  variant?: "solid" | "dashed";
}) {
  if (children && orientation === "horizontal") {
    return (
      <div
        data-slot="separator"
        data-variant={variant}
        role={decorative ? undefined : "separator"}
        className={cn(
          "flex w-full items-center gap-3 text-xs font-medium text-muted-foreground",
          className,
        )}
        {...(props as React.ComponentProps<"div">)}
      >
        <span
          aria-hidden
          className={cn(
            "h-px flex-1",
            variant === "dashed" ? "border-t border-dashed" : "bg-border",
          )}
        />
        <span>{children}</span>
        <span
          aria-hidden
          className={cn(
            "h-px flex-1",
            variant === "dashed" ? "border-t border-dashed" : "bg-border",
          )}
        />
      </div>
    );
  }
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      data-variant={variant}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        variant === "dashed" &&
          "bg-transparent data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-dashed data-[orientation=vertical]:border-l data-[orientation=vertical]:border-dashed",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
