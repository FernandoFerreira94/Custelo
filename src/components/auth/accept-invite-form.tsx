"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PacoteZapMobileHeader } from "@/components/brand/pacotezap-mark";
import { useForm } from "react-hook-form";

import {
  acceptInviteSchema,
  type AcceptInviteInput,
} from "@/components/auth/accept-invite-schema";
import { AuthPasswordField } from "@/components/auth/auth-password-field";
import {
  PREVIEW_INVITE,
  requestAcceptInvite,
} from "@/components/auth/request-accept-invite";
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

type AcceptInviteFormProps = {
  onBack: () => void;
  onActivated: () => void;
};

export function AcceptInviteForm({
  onBack,
  onActivated,
}: AcceptInviteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { fullName: "", password: "" },
  });

  async function onSubmit(values: AcceptInviteInput) {
    await requestAcceptInvite(values);
    onActivated();
  }

  return (
    <Card
      data-login-card
      className="w-full max-w-[420px] font-sans shadow-[var(--shadow-elevation-3)] [--card-spacing:--spacing(8)]"
    >
      <CardHeader>
        <PacoteZapMobileHeader />
        <CardTitle className="font-sans text-2xl font-semibold tracking-tight">
          <h1 className="contents">Aceitar convite</h1>
        </CardTitle>
        <CardDescription>
          {PREVIEW_INVITE.inviter} convidou você para operar no PacoteZap.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={errors.fullName ? true : undefined}>
              <FieldLabel htmlFor="invite-name">Nome completo</FieldLabel>
              <Input
                id="invite-name"
                type="text"
                autoComplete="name"
                placeholder="Carla Souza"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? "invite-name-error" : "invite-name-help"
                }
                className="h-12 min-h-[var(--size-touch-min)]"
                {...register("fullName")}
              />
              {errors.fullName ? (
                <FieldError id="invite-name-error">
                  {errors.fullName.message}
                </FieldError>
              ) : (
                <FieldDescription id="invite-name-help">
                  Aparece na auditoria de cada ação sua
                </FieldDescription>
              )}
            </Field>

            <AuthPasswordField
              id="invite-password"
              label="Criar senha"
              autoComplete="new-password"
              error={errors.password?.message}
              help="Mínimo 10 caracteres"
              showLabel="Mostrar senha do convite"
              hideLabel="Ocultar senha do convite"
              {...register("password")}
            />

            <div className="rounded-[var(--radius-field)] bg-secondary p-4 text-secondary-foreground">
              <p className="text-xs font-semibold tracking-wide uppercase">
                Seu acesso neste convite
              </p>
              <span className="mt-3 inline-flex rounded-[var(--radius-chip)] bg-card px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-foreground/10">
                {PREVIEW_INVITE.role}
              </span>
              <p className="mt-2 text-sm">
                Empreendimentos: {PREVIEW_INVITE.properties}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 min-h-[var(--size-touch-primary)] w-full"
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" aria-label="Carregando" />
                  Criando acesso…
                </>
              ) : (
                "Criar acesso e entrar"
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
          Papel e empreendimentos foram definidos por quem convidou.
        </p>
      </CardFooter>
    </Card>
  );
}
