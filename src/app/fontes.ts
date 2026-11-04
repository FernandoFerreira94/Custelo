import { Inter, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Tipografia — Inter no corpo; Plus Jakarta Sans nos titulos e na wordmark
 * PacoteZap (ADR-021, substitui Poppins e Bodoni Moda).
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-brand",
  display: "swap",
});

/** Classe do <html>: as variaveis precisam estar nele, onde `font-sans` e aplicado. */
export const fontesClassName = `${inter.variable} ${plusJakarta.variable}`;
