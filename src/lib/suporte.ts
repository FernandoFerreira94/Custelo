import { env } from "@/lib/env";

// PROVISÓRIO: endereço de exemplo até o canal real ser definido. Para trocar,
// defina NEXT_PUBLIC_SUPORTE_URL (`mailto:...` ou `https://wa.me/...`); este
// valor deixa de valer assim que a variável existir.
const CANAL_PROVISORIO = "mailto:suporte@pacotezap.com.br";

/** Único lugar que diz para onde vai o botão "Falar com o suporte". */
export const suporteUrl = env.NEXT_PUBLIC_SUPORTE_URL ?? CANAL_PROVISORIO;
