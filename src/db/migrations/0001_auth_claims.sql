-- I2.2 — claims customizados para o Auth Hook (ADR-005)

CREATE OR REPLACE FUNCTION app.resolve_auth_claims(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status usuario_status;
  v_org_id uuid;
  v_empreendimento_id uuid;
  v_papel_codigo text;
  v_emp_scope_count int;
BEGIN
  SELECT status
  INTO v_status
  FROM usuarios
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('user_status', 'missing');
  END IF;

  SELECT count(*)::int
  INTO v_emp_scope_count
  FROM escopos_usuario e
  WHERE e.usuario_id = p_user_id
    AND e.ativo = true
    AND e.empreendimento_id <> '00000000-0000-0000-0000-000000000001'::uuid;

  IF v_emp_scope_count = 1 THEN
    SELECT e.org_id, e.empreendimento_id, p.codigo::text
    INTO v_org_id, v_empreendimento_id, v_papel_codigo
    FROM escopos_usuario e
    INNER JOIN papeis p ON p.id = e.papel_id
    WHERE e.usuario_id = p_user_id
      AND e.ativo = true
      AND e.empreendimento_id <> '00000000-0000-0000-0000-000000000001'::uuid
    LIMIT 1;
  ELSIF v_emp_scope_count = 0 THEN
    SELECT e.org_id, e.empreendimento_id, p.codigo::text
    INTO v_org_id, v_empreendimento_id, v_papel_codigo
    FROM escopos_usuario e
    INNER JOIN papeis p ON p.id = e.papel_id
    WHERE e.usuario_id = p_user_id
      AND e.ativo = true
    LIMIT 1;
  ELSE
    SELECT e.org_id
    INTO v_org_id
    FROM escopos_usuario e
    WHERE e.usuario_id = p_user_id
      AND e.ativo = true
    LIMIT 1;
  END IF;

  RETURN jsonb_strip_nulls(
    jsonb_build_object(
      'user_status', v_status::text,
      'org_id', v_org_id,
      'empreendimento_id',
        CASE
          WHEN v_emp_scope_count > 1 THEN NULL
          ELSE v_empreendimento_id
        END,
      'papel_codigo',
        CASE
          WHEN v_emp_scope_count > 1 THEN NULL
          ELSE v_papel_codigo
        END
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION app.resolve_auth_claims(uuid) TO custelo_app;
