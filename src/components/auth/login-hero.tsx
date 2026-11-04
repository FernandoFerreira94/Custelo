import Image from "next/image";

import { PzMarca } from "@/components/brand/marca";
import loginHero from "../../../Imagen/Penot-referencia/img02.png";

const BULLETS = [
  {
    title: "Sem conta compartilhada",
    body: "cada operador entra com a própria identidade",
  },
  {
    title: "Evidência imutável",
    body: "nenhum papel apaga um evento de auditoria",
  },
  {
    title: "Escopo por empreendimento",
    body: "um porteiro nunca vê o prédio do vizinho",
  },
] as const;

export function LoginHero() {
  return (
    <aside
      data-login-left
      className="absolute inset-y-0 left-0 hidden w-1/2 overflow-hidden bg-primary lg:block"
    >
      <Image
        src={loginHero}
        alt=""
        fill
        priority
        quality={70}
        sizes="50vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-primary/88 via-primary/76 to-primary/64"
      />

      <div className="relative z-10 flex h-full flex-col px-10 py-10 xl:px-14 xl:py-12">
        <header className="flex flex-col gap-2">
          <PzMarca data-login-brand escuro texto="text-3xl" />
          <p data-login-copy className="text-sm text-primary-foreground/70">
            Gestão de encomendas em condomínio
          </p>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-6 py-10">
          <p className="max-w-md font-heading text-3xl leading-tight font-semibold tracking-tight text-primary-foreground xl:text-4xl">
            <span data-login-copy className="block">
              A portaria registra.
            </span>
            <span data-login-copy className="block">
              O morador é avisado.
            </span>
            <span data-login-copy className="block">
              A evidência fica.
            </span>
          </p>
          <p
            data-login-copy
            className="max-w-sm text-sm leading-relaxed text-primary-foreground/80"
          >
            Cada encomenda tem autor, horário e prova de entrega — do
            recebimento na portaria até a assinatura do morador.
          </p>
          <ul className="flex max-w-md flex-col gap-3">
            {BULLETS.map((item) => (
              <li
                key={item.title}
                data-login-copy
                className="flex gap-3 text-sm leading-snug text-primary-foreground/90"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                />
                <span>
                  <span className="font-medium">{item.title}:</span> {item.body}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p data-login-copy className="text-xs text-primary-foreground/50">
          Webcodeff · 2026
        </p>
      </div>
    </aside>
  );
}
