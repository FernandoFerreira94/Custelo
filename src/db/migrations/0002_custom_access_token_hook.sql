-- I2.2 — hook Postgres exigido pelo Supabase Auth (Custom Access Token)

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  custom_claims jsonb;
BEGIN
  custom_claims := app.resolve_auth_claims((event->>'user_id')::uuid);

  RETURN jsonb_set(
    event,
    '{claims}',
    (event->'claims') || custom_claims
  );
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb)
  FROM authenticated, anon, public;
