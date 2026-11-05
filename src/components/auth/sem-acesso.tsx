"use client";

import { LockIcon } from "lucide-react";
import { useActionState } from "react";

import { authCardClass } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Result } from "@/components/ui/result";
import type { Falha } from "@/lib/resultado";
import { cn } from "@/lib/utils";

type SemAcessoProps = {
  email: string | null;
  signOutAction: () => Promise<Falha | void>;
};

export function SemAcesso({ email, signOutAction }: SemAcessoProps) {
  const [falha, sair, saindo] = useActionState(
    async () => (await signOutAction()) ?? null,
    null as Falha | null,
  );

  return (
    <Card className={cn(authCardClass, "pb-(--card-spacing)")}>
      <CardContent className="grid gap-4">
        <Result
          status="warning"
          headingLevel={1}
          icon={<LockIcon aria-hidden className="size-8" />}
          title="Você ainda não tem acesso aqui"
          description="Sua conta existe, mas não está ligada a nenhum empreendimento. Quem libera é o gestor do condomínio."
        />
        {falha ? (
          <Alert variant="danger" role="alert">
            <AlertDescription>{falha.mensagem}</AlertDescription>
          </Alert>
        ) : null}
        <form action={sair}>
          <Button
            type="submit"
            variant="outline"
            shape="pill"
            size="lg"
            className="w-full"
            disabled={saindo}
          >
            Entrar com outra conta
          </Button>
        </form>
        {email ? (
          <p className="text-center text-sm text-muted-foreground">
            Conectado como {email}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
