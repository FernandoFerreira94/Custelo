"use client";

import { HeadsetIcon, MailIcon, MessageCircleIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DescriptionItem,
  DescriptionList,
} from "@/components/ui/description-list";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  RadioGroup,
  RadioGroupCard,
  RadioGroupCardContent,
  RadioGroupCardDescription,
  RadioGroupCardTitle,
} from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { SUPORTE } from "@/lib/suporte";

const TITULO = "Precisa de ajuda para entrar?";

const PROBLEMAS = [
  {
    v: "senha",
    t: "Esqueci a senha ou ela não funciona",
    d: "Aparece “E-mail ou senha incorretos”",
  },
  {
    v: "bloqueio",
    t: "Minha conta foi bloqueada",
    d: "Muitas tentativas seguidas; aparece um tempo de espera",
  },
  {
    v: "link",
    t: "O link do e-mail não abre ou expirou",
    d: "Link de acesso, convite ou troca de senha",
  },
  {
    v: "convite",
    t: "Não recebi o convite nem o e-mail",
    d: "Já olhei a caixa de spam",
  },
  {
    v: "semacesso",
    t: "Entrei, mas aparece “Sem acesso”",
    d: "A conta não está ligada a um condomínio",
  },
  {
    v: "condominio",
    t: "Meu condomínio não aparece na lista",
    d: "Trabalho em mais de um empreendimento",
  },
  {
    v: "carrega",
    t: "A página não carrega ou fica em branco",
    d: "Internet, navegador ou app desatualizado",
  },
  {
    v: "outro",
    t: "Outro problema",
    d: "Conte em poucas palavras abaixo",
  },
] as const;

/** "Chrome · Windows": só o que ajuda o suporte, sem a versão completa. */
function resumirAparelho(userAgent: string): string {
  const navegador = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Navegador";
  const sistema = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad/.test(userAgent)
      ? "iOS"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "sistema desconhecido";
  return `${navegador} · ${sistema}`;
}

function AjudaCorpo() {
  const id = useId();
  const [problema, setProblema] = useState<string>(PROBLEMAS[0].v);
  const [detalhe, setDetalhe] = useState("");

  // O corpo só monta depois do clique, no navegador: ler window aqui é seguro.
  const aparelho = resumirAparelho(navigator.userAgent);
  const pagina = window.location.pathname;

  const titulo = PROBLEMAS.find((p) => p.v === problema)?.t ?? "";
  const mensagem = [
    `Ajuda para entrar: ${titulo}`,
    detalhe.trim(),
    `Aparelho: ${aparelho} · Página: ${pagina}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm font-semibold">O que está acontecendo?</p>
        <RadioGroup
          value={problema}
          onValueChange={setProblema}
          aria-label="O que está acontecendo?"
          className="gap-2"
        >
          {PROBLEMAS.map((p) => (
            <RadioGroupCard key={p.v} value={p.v} id={`${id}-${p.v}`}>
              <RadioGroupCardContent>
                <RadioGroupCardTitle>{p.t}</RadioGroupCardTitle>
                <RadioGroupCardDescription>{p.d}</RadioGroupCardDescription>
              </RadioGroupCardContent>
            </RadioGroupCard>
          ))}
        </RadioGroup>
      </div>
      <Field>
        <FieldLabel htmlFor={`${id}-detalhe`}>
          Quer contar mais? (opcional)
        </FieldLabel>
        <Textarea
          id={`${id}-detalhe`}
          rows={2}
          value={detalhe}
          onChange={(e) => setDetalhe(e.target.value)}
          placeholder="Ex.: troquei de celular ontem e o link não abre"
        />
      </Field>
      <div className="grid gap-2">
        <p className="text-sm font-semibold">Vai junto com o pedido</p>
        <DescriptionList layout="horizontal" bordered>
          <DescriptionItem label="Aparelho">{aparelho}</DescriptionItem>
          <DescriptionItem label="Página">{pagina}</DescriptionItem>
        </DescriptionList>
        <FieldDescription>
          Seu e-mail e sua senha nunca são enviados.
        </FieldDescription>
      </div>
      {SUPORTE.whatsapp || SUPORTE.email ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {SUPORTE.whatsapp ? (
            <Button asChild shape="pill" size="lg">
              <a
                href={`https://wa.me/${SUPORTE.whatsapp}?text=${encodeURIComponent(mensagem)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircleIcon aria-hidden />
                Enviar pelo WhatsApp
              </a>
            </Button>
          ) : null}
          {SUPORTE.email ? (
            <Button asChild variant="outline" shape="pill" size="lg">
              <a
                href={`mailto:${SUPORTE.email}?subject=${encodeURIComponent("Ajuda para entrar no PacoteZap")}&body=${encodeURIComponent(mensagem)}`}
              >
                <MailIcon aria-hidden />
                Enviar por e-mail
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function BotaoAjuda() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          shape="pill"
          size="icon-lg"
          aria-label={TITULO}
          title={TITULO}
        >
          <HeadsetIcon aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent size="md" className="max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>{TITULO}</DialogTitle>
          <DialogDescription>
            Escolha o que mais parece com o seu caso. Assim o suporte já sabe
            por onde começar.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <AjudaCorpo />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
