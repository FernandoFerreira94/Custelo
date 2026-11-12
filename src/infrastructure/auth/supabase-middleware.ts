import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

/**
 * Padrão do @supabase/ssr: a resposta é recriada quando o token renova, para a
 * própria requisição já enxergar o cookie novo (e não só o navegador).
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase middleware indisponivel — variaveis ausentes.");
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  return { supabase, getResponse: () => response };
}
