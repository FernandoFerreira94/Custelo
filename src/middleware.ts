import { type NextRequest, NextResponse } from "next/server";

import {
  AuthTimeoutError,
  comTimeoutDeAuth,
} from "@/infrastructure/auth/com-timeout";
import { createSupabaseMiddlewareClient } from "@/infrastructure/auth/supabase-middleware";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);
  try {
    await comTimeoutDeAuth(supabase.auth.getUser());
  } catch (error) {
    // Supabase fora do ar nao pode travar a pagina; o guard decide o acesso.
    if (!(error instanceof AuthTimeoutError)) throw error;
    console.warn(error.message);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
