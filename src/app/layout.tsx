import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { NotificationBannerHost } from "@/components/ui/notification-banner";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "PacoteZap",
    template: "%s · PacoteZap",
  },
  description:
    "Recebimento e cadeia de custodia para portarias e operacoes prediais.",
  icons: {
    icon: [
      { url: "/brand/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon/favicon.ico", sizes: "any" },
    ],
    apple: "/brand/favicon/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF1F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1B33" },
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
    <html
      lang="pt-BR"
      data-wc-theme="custelo"
      className={`${inter.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
        <Toaster />
        <NotificationBannerHost />
      </body>
    </html>
  );
}
