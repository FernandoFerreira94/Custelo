/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

/**
 * Service worker da portaria. Guarda só a casca e os arquivos estáticos.
 * Resposta de API tem dado pessoal: nunca vai para o Cache Storage (fica no
 * IndexedDB da I6, criptografado pelo aparelho). Por isso `/api/*` é NetworkOnly.
 */
const ROTAS_OPS = ["/receber", "/fila", "/encomendas", "/mais"];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "estaticos",
        plugins: [
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 86_400 }),
        ],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/brand/"),
      handler: new CacheFirst({ cacheName: "marca" }),
    },
    {
      // Só a casca do (ops) (busca no cliente, sem dado pessoal no HTML) abre sem
      // rede. Página da gestão é renderizada no servidor com dado pessoal: não entra.
      matcher: ({ request, url }) =>
        request.mode === "navigate" &&
        ROTAS_OPS.some(
          (r) => url.pathname === r || url.pathname.startsWith(`${r}/`),
        ),
      handler: new NetworkFirst({
        cacheName: "paginas",
        networkTimeoutSeconds: 3,
      }),
    },
  ],
});

serwist.addEventListeners();
