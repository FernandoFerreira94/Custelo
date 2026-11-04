"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Lock, TimerReset } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { authCardClass, authTitleClass } from "@/components/auth/auth-card";
import { loginSchema, type LoginInput } from "@/components/auth/login-schema";
import { requestSession } from "@/components/auth/request-session";
import {
  formatarRegressiva,
  useBloqueioLogin,
} from "@/components/auth/use-bloqueio-login";
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
  // Segue true após o sucesso até a página trocar: evita clique duplo.
  const [saindo, setSaindo] = useState(false);
  const { bloqueado, restanteMs, registrarFalha, zerar } = useBloqueioLogin();

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
      registrarFalha();
      return;
    }

    zerar();
    setSaindo(true);
    window.location.assign(result.redirectTo);
  }

  return (
    <Card data-login-card className={authCardClass}>
      <CardHeader>
        <PzMarca data-login-card-item className="mb-4 lg:hidden" />
        <CardTitle data-login-card-item className={authTitleClass}>
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

            {bloqueado ? (
              <Alert variant="destructive">
                <TimerReset />
                <AlertTitle>Acesso bloqueado por 5 tentativas</AlertTitle>
                <AlertDescription>
                  Tente de novo em{" "}
                  <span className="tabular-nums">
                    {formatarRegressiva(restanteMs)}
                  </span>
                  .
                </AlertDescription>
              </Alert>
            ) : submitError ? (
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
              disabled={isSubmitting || saindo || bloqueado}
              className="h-12 min-h-[var(--size-touch-primary)] w-full"
            >
              {isSubmitting || saindo ? (
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

      <CardFooter className="bg-muted py-4">
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
