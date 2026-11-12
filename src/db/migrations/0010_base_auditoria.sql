-- 0010: base para escrita de domínio — updated_at automático, trilha de auditoria append-only
-- e funções SECURITY DEFINER presas ao usuário da sessão (review 04/11, bug 7).

CREATE OR REPLACE FUNCTION app.tocar_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['areas','unidades','pontos_recebimento','pessoas','vinculos'] LOOP
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tocar_updated_at()',
      t || '_tocar', t);
  END LOOP;
END $$;

CREATE TABLE "audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE RESTRICT,
  "empreendimento_id" uuid NOT NULL,
  "ator_usuario_id" uuid,
  "acao" text NOT NULL,
  "alvo_tipo" text NOT NULL,
  "alvo_id" uuid,
  "antes" jsonb,
  "depois" jsonb,
  "motivo" text,
  "origem" text NOT NULL CHECK ("origem" IN ('web','ops','saas','sistema','suporte_jit','importacao')),
  "request_id" text,
  "criado_em" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX "audit_log_emp_idx" ON "audit_log" ("empreendimento_id", "criado_em" DESC);
CREATE INDEX "audit_log_org_idx" ON "audit_log" ("org_id", "criado_em" DESC);
CREATE INDEX "audit_log_alvo_idx" ON "audit_log" ("alvo_tipo", "alvo_id");

CREATE OR REPLACE FUNCTION app.bloquear_alteracao() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'APPEND_ONLY: % não aceita %', TG_TABLE_NAME, TG_OP;
END;
$$;
CREATE TRIGGER "audit_log_append_only" BEFORE UPDATE OR DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION app.bloquear_alteracao();

ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_tenant_isolation" ON "audit_log" FOR ALL
  USING (org_id = app.current_org_id()
         AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()))
  WITH CHECK (org_id = app.current_org_id()
         AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()));
REVOKE ALL ON "audit_log" FROM custelo_app;
GRANT SELECT, INSERT ON "audit_log" TO custelo_app;

-- Funções chamadas pelo app com p_user_id: o id precisa ser o da sessão (GUC app.current_user_id).
CREATE OR REPLACE FUNCTION app.exigir_usuario_da_sessao(p_user_id uuid) RETURNS void
LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM app.current_user_id() THEN
    RAISE EXCEPTION 'FORBIDDEN: usuário diferente da sessão';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION app.list_escopos_acessiveis(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM app.exigir_usuario_da_sessao(p_user_id);
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
  PERFORM app.exigir_usuario_da_sessao(p_user_id);
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

-- resolve_auth_claims: o corpo atual vira _interno (só o hook do token o chama);
-- a versão pública exige o usuário da sessão.
CREATE OR REPLACE FUNCTION app.resolve_auth_claims_interno(p_user_id uuid)
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

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  custom_claims jsonb;
BEGIN
  custom_claims := app.resolve_auth_claims_interno((event->>'user_id')::uuid);

  RETURN jsonb_set(
    event,
    '{claims}',
    (event->'claims') || custom_claims
  );
END;
$$;

CREATE OR REPLACE FUNCTION app.resolve_auth_claims(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM app.exigir_usuario_da_sessao(p_user_id);
  RETURN app.resolve_auth_claims_interno(p_user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION app.resolve_auth_claims_interno(uuid) FROM custelo_app, PUBLIC;
