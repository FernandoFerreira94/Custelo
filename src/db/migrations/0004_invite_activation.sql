-- AUTH-002: aceite de convite. O app nao pode alterar status diretamente.
REVOKE UPDATE (status) ON usuarios FROM custelo_app;

CREATE OR REPLACE FUNCTION app.aceitar_convite(p_nome text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := app.current_user_id();
BEGIN
  IF v_user_id IS NULL OR btrim(p_nome) = '' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_INVITE');
  END IF;

  UPDATE usuarios
  SET nome = btrim(p_nome), status = 'ativo', updated_at = now()
  WHERE id = v_user_id
    AND status = 'convite_pendente';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_INVITE');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION app.aceitar_convite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.aceitar_convite(text) TO custelo_app;
