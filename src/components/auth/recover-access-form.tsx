"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authCardClass, authTitleClass } from "@/components/auth/auth-card";
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
import { CircleAlert, MailIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Banner,
  BannerContent,
  BannerDescription,
  BannerTitle,
} from "@/components/ui/banner";
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
      setFormError(result.mensagem);
      return;
    }

    setSuccessMessage(result.mensagem || RECOVERY_ACCEPTED);
  }

  if (successMessage) {
    return (
      <Card data-login-card className={authCardClass}>
        <CardHeader>
          <PzMarca className="mb-4 lg:hidden" />
          <CardTitle className={authTitleClass}>
            <h1 className="contents">Link enviado</h1>
          </CardTitle>
          <CardDescription>{successMessage}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Banner variant="success" className="rounded-2xl">
            <MailIcon aria-hidden />
            <BannerContent>
              <BannerTitle>Confira seu e-mail</BannerTitle>
              <BannerDescription>
                Se existir uma conta com esse e-mail, o link chega em alguns
                minutos.
              </BannerDescription>
            </BannerContent>
          </Banner>
          <Button
            type="button"
            variant="link"
            onClick={onBack}
            className="h-auto min-h-[var(--size-touch-min)] w-full underline"
          >
            Voltar para o login
          </Button>
        </CardContent>
        <CardFooter className="bg-muted py-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Verifique também a pasta de spam. O link vale por 30 min.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card data-login-card className={authCardClass}>
      <CardHeader>
        <PzMarca className="mb-4 lg:hidden" />
        <CardTitle className={authTitleClass}>
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
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Não foi possível enviar o link</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
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

      <CardFooter className="bg-muted py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Se existir uma conta com esse e-mail, o link será enviado. Por
          segurança, não confirmamos quais e-mails estão cadastrados.
        </p>
      </CardFooter>
    </Card>
  );
}
