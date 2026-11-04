import { LockIcon } from "lucide-react";

import { authCardClass } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Result } from "@/components/ui/result";
import { cn } from "@/lib/utils";

type SemAcessoProps = {
  email: string | null;
  signOutAction: () => Promise<void>;
};

export function SemAcesso({ email, signOutAction }: SemAcessoProps) {
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
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            shape="pill"
            size="lg"
            className="w-full"
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
