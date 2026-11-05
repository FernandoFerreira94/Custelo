import type { UnidadeNaArvore } from "@/application/estrutura/ports";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";

/** Detalhe da unidade selecionada na árvore (UNI-001). */
export function PainelUnidade({
  unidade,
  area,
}: {
  unidade: UnidadeNaArvore;
  /** Caminho da área, ex.: "Bloco B · 3º andar". */
  area: string | null;
}) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="font-mono text-2xl">{unidade.codigo}</CardTitle>
        <CardDescription>{area ?? "Sem bloco"}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <DescriptionList layout="horizontal">
          <DescriptionItem label="Como aparece na etiqueta">
            {unidade.apelidos.length > 0 ? (
              <span className="flex flex-wrap gap-1">
                {unidade.apelidos.map((a) => (
                  <Badge key={a} variant="secondary">
                    {a}
                  </Badge>
                ))}
              </span>
            ) : (
              "Nenhum jeito alternativo cadastrado"
            )}
          </DescriptionItem>
          <DescriptionItem label="Moradores">
            {unidade.moradores.length > 0
              ? unidade.moradores.join(", ")
              : "Ninguém cadastrado"}
          </DescriptionItem>
          {/* Até a I4 não há encomenda em custódia para mostrar. */}
          <DescriptionItem label="Em custódia">—</DescriptionItem>
        </DescriptionList>
        <p className="text-xs text-muted-foreground">
          Os jeitos de escrever ajudam a leitura da etiqueta a achar a unidade
          certa.
        </p>
      </CardContent>
    </Card>
  );
}
