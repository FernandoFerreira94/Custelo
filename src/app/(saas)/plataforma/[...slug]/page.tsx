import { notFound } from "next/navigation";

// Rota desconhecida dentro da superfície: 404 dentro da casca, não na tela cheia da raiz.
export default function RotaDesconhecida() {
  notFound();
}
