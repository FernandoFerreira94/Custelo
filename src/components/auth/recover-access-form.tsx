"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PzMarca } from "@/components/brand/marca";
import { useForm } from "react-hook-form";
import { useState } from "react";

import {
  recoverSchema,
  type RecoverInput,
} from "@/components/auth/recover-schema";
import {
  RECOVERY_ACCEPTED,
  requestRecovery,
} from "@/components/auth/request-recovery";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type RecoverAccessFormProps = {
  onBack: () => void;
};

export function RecoverAccessForm({ onBack }: RecoverAccessFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(values: RecoverInput) {
    setFormError(null);
    const result = await requestRecovery(values);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setSuccessMessage(result.message || RECOVERY_ACCEPTED);
  }

  if (successMessage) {
    return (
      <Card
        data-login-card
        className="w-full max-w-[420px] font-sans shadow-[var(--shadow-elevation-3)] [--card-spacing:--spacing(8)]"
      >
        <CardHeader>
          <PzMarca className="mb-4 lg:hidden" />
          <CardTitle className="font-sans text-2xl font-semibold tracking-tight">
            <h1 className="contents">Link enviado</h1>
          </CardTitle>
          <CardDescription>{successMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="link"
            onClick={onBack}
            className="h-auto min-h-[var(--size-touch-min)] w-full underline"
          >
            Voltar para o login
          </Button>
        </CardContent>
        <CardFooter className="bg-muted">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Verifique também a pasta de spam. O link vale por 30 min.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card
      data-login-card
      className="w-full max-w-[420px] font-sans shadow-[var(--shadow-elevation-3)] [--card-spacing:--spacing(8)]"
    >
      <CardHeader>
        <PzMarca className="mb-4 lg:hidden" />
        <CardTitle className="font-sans text-2xl font-semibold tracking-tight">
          <h1 className="contents">Recuperar acesso</h1>
        </CardTitle>
        <CardDescription>
          Enviaremos um link para você definir uma nova senha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="recover-email">E-mail</FieldLabel>
              <Input
                id="recover-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="condominio@condominio.com.br"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "recover-email-error" : "recover-email-help"
                }
                className="h-12 min-h-[var(--size-touch-min)]"
                {...register("email")}
              />
              {errors.email ? (
                <FieldError id="recover-email-error">
                  {errors.email.message}
                </FieldError>
              ) : (
                <FieldDescription id="recover-email-help">
                  O link vale por 30 min e só pode ser usado uma vez
                </FieldDescription>
              )}
            </Field>

            {formError ? (
              <FieldError role="alert">{formError}</FieldError>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 min-h-[var(--size-touch-primary)] w-full"
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" aria-label="Carregando" />
                  Enviando…
                </>
              ) : (
                "Enviar link de recuperação"
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={onBack}
              className="h-auto min-h-[var(--size-touch-min)] w-full underline"
            >
              Voltar para o login
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="bg-muted">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Se existir uma conta com esse e-mail, o link será enviado. Por
          segurança, não confirmamos quais e-mails estão cadastrados.
        </p>
      </CardFooter>
    </Card>
  );
}
