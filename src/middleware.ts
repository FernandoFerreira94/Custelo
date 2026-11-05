import { type NextRequest, NextResponse } from "next/server";

import {
  AuthTimeoutError,
  comTimeoutDeAuth,
} from "@/infrastructure/auth/com-timeout";
import { createSupabaseMiddlewareClient } from "@/infrastructure/auth/supabase-middleware";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    env.MANUTENCAO === "1" &&
    !pathname.startsWith("/manutencao") &&
    !pathname.startsWith("/api/health")
  ) {
    return NextResponse.rewrite(new URL("/manutencao", request.url));
  }
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const { supabase, getResponse } = createSupabaseMiddlewareClient(request);
  try {
    await comTimeoutDeAuth(supabase.auth.getUser());
  } catch (error) {
    // Supabase fora do ar nao pode travar a pagina; o guard decide o acesso.
    if (!(error instanceof AuthTimeoutError)) throw error;
    console.warn(error.message);
  }
  return getResponse();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
