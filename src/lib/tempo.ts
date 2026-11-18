const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

/** "agora", "há 12 min", "há 3 h", "há 2 dias": idade curta para listas da portaria. */
export function haQuanto(quando: Date, agora: Date): string {
  const d = Math.max(0, agora.getTime() - quando.getTime());
  if (d < MIN) return "agora";
  if (d < HORA) return `há ${Math.floor(d / MIN)} min`;
  if (d < DIA) return `há ${Math.floor(d / HORA)} h`;
  const dias = Math.floor(d / DIA);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

const FUSO = "America/Sao_Paulo";

/** "03/11 às 14:32" no fuso do empreendimento. */
export function diaEHora(quando: Date): string {
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, ...o }).format(quando);
  return `${f({ day: "2-digit", month: "2-digit" })} às ${f({ hour: "2-digit", minute: "2-digit" })}`;
}
