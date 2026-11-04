"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authCardClass, authTitleClass } from "@/components/auth/auth-card";
import { PzMarca } from "@/components/brand/marca";
import { useForm, useWatch } from "react-hook-form";
import { useState } from "react";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { requestSetPassword } from "@/components/auth/request-set-password";
import {
  setPasswordSchema,
  type SetPasswordInput,
} from "@/components/auth/set-password-schema";
import { CircleAlert } from "lucide-react";

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
import { FieldGroup } from "@/components/ui/field";
import {
  defaultPasswordRules,
  PasswordStrength,
  type PasswordRule,
} from "@/components/ui/password-strength";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// A regra de 10 caracteres espelha password-policy; o medidor só orienta.
const regrasDeSenha: PasswordRule[] = [
  {
    id: "length",
    label: "Pelo menos 10 caracteres",
    test: (valor) => valor.length >= 10,
  },
  ...defaultPasswordRules.filter((regra) => regra.id !== "length"),
];

type SetPasswordFormProps = {
  onBack: () => void;
  onSaved: (redirectTo?: string) => void;
};

export function SetPasswordForm({ onBack, onSaved }: SetPasswordFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const senha = useWatch({ control, name: "password" });
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(values: SetPasswordInput) {
    setFormError(null);
    const result = await requestSetPassword(values);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    toast.success("Senha alterada.", {
      description: "Use a nova senha no próximo acesso.",
    });
    onSaved(result.redirectTo);
  }

  return (
    <Card data-login-card className={authCardClass}>
      <CardHeader>
        <PzMarca className="mb-4 lg:hidden" />
        <CardTitle className={authTitleClass}>
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
            <PasswordStrength value={senha ?? ""} rules={regrasDeSenha} />

            <AuthPasswordField
              id="confirm-password"
              label="Confirmar senha"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              showLabel="Mostrar confirmação da senha"
              hideLabel="Ocultar confirmação da senha"
              {...register("confirmPassword")}
            />

            {formError ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Não foi possível salvar a senha</AlertTitle>
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

      <CardFooter className="bg-muted py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          O link vale por 30 min e só pode ser usado uma vez. Ao salvar, as
          sessões abertas desta conta são encerradas.
        </p>
      </CardFooter>
    </Card>
  );
}
