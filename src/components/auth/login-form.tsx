"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { loginSchema, type LoginInput } from "@/components/auth/login-schema";
import { requestSession } from "@/components/auth/request-session";
import { PzMarca } from "@/components/brand/marca";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

type LoginFormProps = {
  onInvite: () => void;
  onRecover: () => void;
  initialError?: string | null;
};

export function LoginForm({
  onInvite,
  onRecover,
  initialError = null,
}: LoginFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(initialError);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginInput) {
    setSubmitError(null);
    const result = await requestSession(values);
    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    window.location.assign(result.redirectTo);
  }

  return (
    <Card
      data-login-card
      className="w-full max-w-[420px] font-sans shadow-[var(--shadow-elevation-3)] [--card-spacing:--spacing(8)]"
    >
      <CardHeader>
        <PzMarca data-login-card-item className="mb-4 lg:hidden" />
        <CardTitle
          data-login-card-item
          className="font-sans text-2xl font-semibold tracking-tight"
        >
          <h1 className="contents">Entrar</h1>
        </CardTitle>
        <CardDescription data-login-card-item>
          Use o e-mail cadastrado pela administração.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field
              data-login-card-item
              data-invalid={errors.email ? true : undefined}
            >
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="condominio@condominio.com.br"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : "email-help"}
                className="h-12 min-h-[var(--size-touch-min)]"
                {...register("email")}
              />
              {errors.email ? (
                <FieldError id="email-error">{errors.email.message}</FieldError>
              ) : (
                <FieldDescription id="email-help">
                  Conta individual — nunca compartilhe o acesso
                </FieldDescription>
              )}
            </Field>

            <AuthPasswordField
              id="password"
              label="Senha"
              autoComplete="current-password"
              error={errors.password?.message}
              cardItem
              labelEnd={
                <Button
                  type="button"
                  variant="link"
                  onClick={onRecover}
                  className="h-auto min-h-[var(--size-touch-min)] px-0 underline"
                >
                  Esqueci minha senha
                </Button>
              }
              {...register("password")}
            />

            {submitError ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Não foi possível entrar</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              data-login-cta
              data-login-card-item
              type="submit"
              disabled={isSubmitting}
              className="h-12 min-h-[var(--size-touch-primary)] w-full"
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" aria-label="Carregando" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={onInvite}
              className="h-auto min-h-[var(--size-touch-min)] w-full underline"
            >
              Aceitar convite
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="bg-muted">
        <p
          data-login-card-item
          className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
        >
          <Lock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          Após 5 tentativas o acesso é bloqueado por 15 min. Conta desativada
          não entra, mesmo com senha correta.
        </p>
      </CardFooter>
    </Card>
  );
}
