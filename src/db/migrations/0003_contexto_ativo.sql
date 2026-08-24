-- I2.3 / AUTH-005 — persistencia de contexto selecionado (ADR-005)

CREATE TABLE "contexto_ativo" (
  "usuario_id" uuid PRIMARY KEY NOT NULL REFERENCES "usuarios"("id") ON DELETE cascade,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE cascade,
  "empreendimento_id" uuid NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "contexto_ativo_org_id_idx" ON "contexto_ativo" ("org_id");

ALTER TABLE "contexto_ativo" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contexto_ativo_self"
  ON "contexto_ativo"
  FOR ALL
  USING (usuario_id = app.current_user_id())
  WITH CHECK (usuario_id = app.current_user_id());

CREATE OR REPLACE FUNCTION app.list_escopos_acessiveis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN coalesce(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'org_id', e.org_id,
          'org_nome', o.nome,
          'empreendimento_id', e.empreendimento_id,
          'empreendimento_nome',
            CASE
              WHEN e.empreendimento_id = '00000000-0000-0000-0000-000000000001'::uuid
                THEN NULL
              ELSE emp.nome
            END,
          'is_org_scope',
            e.empreendimento_id = '00000000-0000-0000-0000-000000000001'::uuid,
          'papel_codigo', p.codigo::text,
          'papel_nome', p.nome
        )
        ORDER BY o.nome, emp.nome NULLS FIRST
      )
      FROM escopos_usuario e
      INNER JOIN organizacoes o ON o.id = e.org_id
      INNER JOIN papeis p ON p.id = e.papel_id
      LEFT JOIN empreendimentos emp
        ON emp.id = e.empreendimento_id
        AND e.empreendimento_id <> '00000000-0000-0000-0000-000000000001'::uuid
      WHERE e.usuario_id = p_user_id
        AND e.ativo = true
    ),
    '[]'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION app.definir_contexto_ativo(
  p_user_id uuid,
  p_org_id uuid,
  p_empreendimento_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_papel_codigo text;
BEGIN
  SELECT p.codigo::text
  INTO v_papel_codigo
  FROM escopos_usuario e
  INNER JOIN papeis p ON p.id = e.papel_id
  WHERE e.usuario_id = p_user_id
    AND e.org_id = p_org_id
    AND e.empreendimento_id = p_empreendimento_id
    AND e.ativo = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_SCOPE');
  END IF;

  INSERT INTO contexto_ativo (usuario_id, org_id, empreendimento_id, updated_at)
  VALUES (p_user_id, p_org_id, p_empreendimento_id, now())
  ON CONFLICT (usuario_id) DO UPDATE SET
    org_id = excluded.org_id,
    empreendimento_id = excluded.empreendimento_id,
    updated_at = excluded.updated_at;

  RETURN jsonb_build_object(
    'ok', true,
    'papel_codigo', v_papel_codigo
  );
END;
$$;

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
    SELECT ca.org_id, ca.empreendimento_id, p.codigo::text
    INTO v_org_id, v_empreendimento_id, v_papel_codigo
    FROM contexto_ativo ca
    INNER JOIN escopos_usuario e
      ON e.usuario_id = ca.usuario_id
      AND e.org_id = ca.org_id
      AND e.empreendimento_id = ca.empreendimento_id
      AND e.ativo = true
    INNER JOIN papeis p ON p.id = e.papel_id
    WHERE ca.usuario_id = p_user_id;

    IF NOT FOUND THEN
      SELECT e.org_id
      INTO v_org_id
      FROM escopos_usuario e
      WHERE e.usuario_id = p_user_id
        AND e.ativo = true
      LIMIT 1;
    END IF;
  END IF;

  RETURN jsonb_strip_nulls(
    jsonb_build_object(
      'user_status', v_status::text,
      'org_id', v_org_id,
      'empreendimento_id',
        CASE
          WHEN v_emp_scope_count > 1 AND v_empreendimento_id IS NULL THEN NULL
          ELSE v_empreendimento_id
        END,
      'papel_codigo',
        CASE
          WHEN v_emp_scope_count > 1 AND v_papel_codigo IS NULL THEN NULL
          ELSE v_papel_codigo
        END
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION app.list_escopos_acessiveis(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.definir_contexto_ativo(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.list_escopos_acessiveis(uuid) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.definir_contexto_ativo(uuid, uuid, uuid) TO custelo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "contexto_ativo" TO custelo_app;
