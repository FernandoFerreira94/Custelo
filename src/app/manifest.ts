import type { MetadataRoute } from "next";

/** PWA da portaria: abre direto no recebimento, em tela cheia de app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PacoteZap Portaria",
    short_name: "PacoteZap",
    description: "Recebimento e guarda de encomendas na portaria.",
    start_url: "/receber",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0c2c55",
    lang: "pt-BR",
    icons: [
      {
        src: "/brand/favicon/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/favicon/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/favicon/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/favicon/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
