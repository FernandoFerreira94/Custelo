import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";

import "./globals.css";

/**
 * Tipografia de produto — Inter (Brand & UI Foundation §8).
 * Bodoni Moda cobre a direcao didone da wordmark ate a fonte original e a
 * licenca serem confirmadas pelo cliente.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Custelo",
    template: "%s · Custelo",
  },
  description:
    "Recebimento e cadeia de custodia para portarias e operacoes prediais.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FEFAEF" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1533" },
  ],
  // O PWA operacional e usado com uma mao, em aparelho de portaria.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${bodoniModa.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
