import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";

import "./globals.css";

/**
 * Tipografia de produto — Inter (Brand & UI Foundation §8).
 * Poppins SemiBold na parte "Zap" da wordmark PacoteZap.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PacoteZap",
    template: "%s · PacoteZap",
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
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
