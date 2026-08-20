"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PacoteZapMobileHeader } from "@/components/brand/pacotezap-mark";
import { useForm } from "react-hook-form";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { requestSetPassword } from "@/components/auth/request-set-password";
import {
  setPasswordSchema,
  type SetPasswordInput,
} from "@/components/auth/set-password-schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

type SetPasswordFormProps = {
  onBack: () => void;
  onSaved: () => void;
};

export function SetPasswordForm({ onBack, onSaved }: SetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SetPasswordInput) {
    await requestSetPassword(values);
    onSaved();
  }

  return (
    <Card
      data-login-card
      className="w-full max-w-[420px] font-sans shadow-[var(--shadow-elevation-3)] [--card-spacing:--spacing(8)]"
    >
      <CardHeader>
        <PacoteZapMobileHeader />
        <CardTitle className="font-sans text-2xl font-semibold tracking-tight">
          <h1 className="contents">Definir nova senha</h1>
        </CardTitle>
        <CardDescription>Crie uma senha de acesso individual.</CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <AuthPasswordField
              id="new-password"
              label="Nova senha"
              autoComplete="new-password"
              error={errors.password?.message}
              help="Mínimo 10 caracteres"
              showLabel="Mostrar nova senha"
              hideLabel="Ocultar nova senha"
              {...register("password")}
            />

            <AuthPasswordField
              id="confirm-password"
              label="Confirmar senha"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              showLabel="Mostrar confirmação da senha"
              hideLabel="Ocultar confirmação da senha"
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 min-h-[var(--size-touch-primary)] w-full"
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" aria-label="Carregando" />
                  Salvando…
                </>
              ) : (
                "Salvar senha"
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
          O link vale por 30 min e só pode ser usado uma vez. Ao salvar, as
          sessões abertas desta conta são encerradas.
        </p>
      </CardFooter>
    </Card>
  );
}
