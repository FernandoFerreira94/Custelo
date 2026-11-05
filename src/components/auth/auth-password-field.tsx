"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { DicaCampo } from "@/components/auth/dica-campo";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  error?: string;
  help?: string;
  autoComplete?: string;
  placeholder?: string;
  cardItem?: boolean;
  showLabel?: string;
  hideLabel?: string;
  labelEnd?: ReactNode;
} & UseFormRegisterReturn;

export function AuthPasswordField({
  id,
  label,
  error,
  help,
  autoComplete = "new-password",
  placeholder = "••••••••",
  cardItem = false,
  showLabel = "Mostrar senha",
  hideLabel = "Ocultar senha",
  labelEnd,
  ...register
}: AuthPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field
      data-login-card-item={cardItem || undefined}
      data-invalid={error ? true : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {labelEnd ?? (help ? <DicaCampo texto={help} /> : null)}
      </div>
      <InputGroup className="h-12 min-h-[var(--size-touch-min)]">
        <InputGroupInput
          id={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-sm"
            className="min-h-[var(--size-touch-min)] min-w-[var(--size-touch-min)]"
            aria-label={showPassword ? hideLabel : showLabel}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  );
}
