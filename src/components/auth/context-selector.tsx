"use client";

import { Building2, CircleAlert } from "lucide-react";
import { useState, useTransition } from "react";

import { selectContextAction } from "@/app/(auth)/contexto/actions";
import type { UserScope } from "@/application/auth/user-scope";
import { labelForScope } from "@/application/auth/user-scope";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupCard,
  RadioGroupCardContent,
  RadioGroupCardDescription,
  RadioGroupCardTitle,
} from "@/components/ui/radio-group";
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
  initialError?: string | null;
};

const chaveDoEscopo = (scope: UserScope) =>
  `${scope.orgId}:${scope.empreendimentoId}`;

export function ContextSelector({
  scopes,
  initialError = null,
}: ContextSelectorProps) {
  const [submitError, setSubmitError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();
  // Sem escolha inicial: cada registro vai para o empreendimento escolhido,
  // então a pessoa precisa dizer onde está em vez de aceitar o primeiro da lista.
  const [selecionado, setSelecionado] = useState<string>("");

  const escopo = scopes.find((s) => chaveDoEscopo(s) === selecionado);

  function handleContinue() {
    if (!escopo) return;
    setSubmitError(null);

    startTransition(async () => {
      let result: Awaited<ReturnType<typeof selectContextAction>>;
      try {
        result = await selectContextAction({
          orgId: escopo.orgId,
          empreendimentoId: escopo.empreendimentoId,
        });
      } catch (falha) {
        setSubmitError(mensagemDeFalha(falha));
        return;
      }

      if (!result.ok) {
        setSubmitError(MENSAGEM_CONTEXTO[result.code]);
        return;
      }

      window.location.assign(result.redirectTo);
    });
  }

  return (
    <div className="grid w-full gap-6">
      <div className="grid gap-2">
        <h1 className="font-brand text-3xl font-extrabold tracking-tight sm:text-4xl">
          Onde você está hoje?
        </h1>
        <p className="text-muted-foreground">
          Tudo o que você registrar vai para este empreendimento.
        </p>
      </div>

      <RadioGroup
        value={selecionado}
        onValueChange={setSelecionado}
        disabled={isPending}
        aria-label="Empreendimento"
        className="grid gap-3"
      >
        {scopes.map((scope) => (
          <RadioGroupCard
            key={chaveDoEscopo(scope)}
            value={chaveDoEscopo(scope)}
          >
            <Building2
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground"
            />
            <RadioGroupCardContent>
              <RadioGroupCardTitle>{labelForScope(scope)}</RadioGroupCardTitle>
              <RadioGroupCardDescription>
                {scope.papelNome}
              </RadioGroupCardDescription>
            </RadioGroupCardContent>
          </RadioGroupCard>
        ))}
      </RadioGroup>

      {submitError ? (
        <Alert variant="danger" role="alert">
          <CircleAlert />
          <AlertTitle>Não foi possível continuar</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="button"
        shape="pill"
        size="lg"
        className="w-full"
        disabled={!escopo || isPending}
        onClick={handleContinue}
      >
        {isPending ? (
          <>
            <Spinner data-icon="inline-start" aria-label="Carregando" />
            Entrando…
          </>
        ) : escopo ? (
          `Começar em ${labelForScope(escopo)}`
        ) : (
          "Escolha um empreendimento"
        )}
      </Button>
    </div>
  );
}
