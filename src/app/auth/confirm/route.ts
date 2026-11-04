import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";

const supportedTypes = new Set<EmailOtpType>(["invite", "recovery"]);
const supportedViews = new Set(["convite", "senha"]);

function errorRedirect(requestUrl: URL) {
  return NextResponse.redirect(
    new URL("/entrar?auth_error=invalid_link", requestUrl.origin),
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const rawType = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");
  const requestedView = requestUrl.searchParams.get("view");

  if (code && requestedView && supportedViews.has(requestedView)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return errorRedirect(requestUrl);
    }

    return NextResponse.redirect(
      new URL(`/entrar?view=${requestedView}`, requestUrl.origin),
    );
  }

  if (!tokenHash || !rawType || !supportedTypes.has(rawType as EmailOtpType)) {
    return errorRedirect(requestUrl);
  }

  const type = rawType as "invite" | "recovery";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return errorRedirect(requestUrl);
  }

  const view = type === "invite" ? "convite" : "senha";
  return NextResponse.redirect(
    new URL(`/entrar?view=${view}`, requestUrl.origin),
  );
}
