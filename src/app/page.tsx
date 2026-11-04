import { redirect } from "next/navigation";

/**
 * Raiz sem tela própria: quem chega aqui segue para /contexto, que decide a
 * superfície pela sessão (sem sessão -> /entrar, um só empreendimento -> direto).
 */
export default function Home() {
  redirect("/contexto");
}
