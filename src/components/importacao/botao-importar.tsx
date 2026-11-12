import { FileSpreadsheetIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** IMP-010: entrada da importação no cabeçalho das listas. */
export function BotaoImportar({ slug }: { slug: string }) {
  return (
    <Button asChild variant="outline" shape="pill">
      <Link href={`/gestao/importar/${slug}`}>
        <FileSpreadsheetIcon aria-hidden /> Importar planilha
      </Link>
    </Button>
  );
}
