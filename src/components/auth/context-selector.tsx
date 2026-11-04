"use client";

import { Building2, CircleAlert } from "lucide-react";
import { useState, useTransition } from "react";

import { selectContextAction } from "@/app/(auth)/contexto/actions";
import type { UserScope } from "@/application/auth/user-scope";
import { labelForScope } from "@/application/auth/user-scope";
import { PacoteZapMark } from "@/components/brand/pacotezap-mark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { MSG, mensagemDeFalha } from "@/lib/mensagens";

const MENSAGEM_CONTEXTO = {
  UNAUTHORIZED: MSG.sessaoExpirada,
  INVALID_SCOPE:
    "Seu acesso a este empreendimento mudou. Atualize a página para ver a lista atual.",
  SESSION_REFRESH_FAILED:
    "Não conseguimos abrir este empreendimento agora. Tente de novo.",
} as const;

type ContextSelectorProps = {
  scopes: UserScope[];
};

export function ContextSelector({ scopes }: ContextSelectorProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  function handleSelect(scope: UserScope) {
    const key = `${scope.orgId}:${scope.empreendimentoId}`;
    setActiveKey(key);
    setSubmitError(null);

    startTransition(async () => {
      let result: Awaited<ReturnType<typeof selectContextAction>>;
      try {
        result = await selectContextAction({
          orgId: scope.orgId,
          empreendimentoId: scope.empreendimentoId,
        });
      } catch (falha) {
        setSubmitError(mensagemDeFalha(falha));
        setActiveKey(null);
        return;
      }

      if (!result.ok) {
        setSubmitError(MENSAGEM_CONTEXTO[result.code]);
        setActiveKey(null);
        return;
      }

      window.location.assign(result.redirectTo);
    });
  }

  return (
    <Card className="w-full max-w-[480px] font-sans shadow-[var(--shadow-elevation-3)]">
      <CardHeader>
        <PacoteZapMark showIcon={false} textClassName="text-xl" />
        <CardTitle className="font-sans text-2xl font-semibold tracking-tight">
          <h1 className="contents">Selecionar contexto</h1>
        </CardTitle>
        <CardDescription>
          Escolha a organização e o empreendimento para continuar.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {scopes.map((scope) => {
          const key = `${scope.orgId}:${scope.empreendimentoId}`;
          const isActive = activeKey === key && isPending;

          return (
            <Button
              key={key}
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleSelect(scope)}
              className="h-auto min-h-[var(--size-touch-primary)] w-full justify-start gap-3 px-4 py-3 text-left"
            >
              <Building2
                aria-hidden="true"
                className="size-5 shrink-0 text-primary"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">
                  {labelForScope(scope)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {scope.papelNome}
                </span>
              </span>
              {isActive ? (
                <Spinner
                  data-icon="inline-end"
                  className="ml-auto shrink-0"
                  aria-label="Carregando"
                />
              ) : null}
            </Button>
          );
        })}

        {submitError ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Não foi possível continuar</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
