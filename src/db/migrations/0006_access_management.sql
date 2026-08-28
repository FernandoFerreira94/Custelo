-- I2.3: gestao de acesso — convite, escopos e desativacao.

CREATE OR REPLACE FUNCTION app.actor_pode_gerir(
  p_org_id uuid,
  p_empreendimento_id uuid,
  p_papel_codigo papel_codigo
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN app.current_user_id() IS NULL THEN false
    WHEN p_papel_codigo IN ('platform_super_admin', 'org_admin') THEN false
    WHEN EXISTS (
      SELECT 1
      FROM escopos_usuario e
      JOIN papeis p ON p.id = e.papel_id
      WHERE e.usuario_id = app.current_user_id()
        AND e.ativo = true
        AND p.codigo = 'org_admin'
        AND e.org_id = p_org_id
    ) THEN true
    WHEN p_empreendimento_id = '00000000-0000-0000-0000-000000000001'::uuid THEN false
    WHEN EXISTS (
      SELECT 1
      FROM escopos_usuario e
      JOIN papeis p ON p.id = e.papel_id
      WHERE e.usuario_id = app.current_user_id()
        AND e.ativo = true
        AND p.codigo = 'empreendimento_gestor'
        AND e.org_id = p_org_id
        AND e.empreendimento_id = p_empreendimento_id
    ) THEN true
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION app.obter_convite_pendente()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := app.current_user_id();
  v_payload jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = v_user_id AND u.status = 'convite_pendente'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_INVITE');
  END IF;

  SELECT jsonb_build_object(
    'ok', true,
    'role', p.nome,
    'properties', CASE
      WHEN e.empreendimento_id = '00000000-0000-0000-0000-000000000001'::uuid
        THEN o.nome
      ELSE o.nome || ' · ' || emp.nome
    END,
    'inviter', 'Administracao'
  )
  INTO v_payload
  FROM escopos_usuario e
  JOIN papeis p ON p.id = e.papel_id
  JOIN organizacoes o ON o.id = e.org_id
  LEFT JOIN empreendimentos emp ON emp.id = e.empreendimento_id
  WHERE e.usuario_id = v_user_id
    AND e.ativo = true
  ORDER BY e.created_at
  LIMIT 1;

  IF v_payload IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_INVITE');
  END IF;

  RETURN v_payload;
END;
$$;

CREATE OR REPLACE FUNCTION app.registrar_convite_pendente(
  p_user_id uuid,
  p_email text,
  p_org_id uuid,
  p_empreendimento_id uuid,
  p_papel_codigo papel_codigo
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_papel_id uuid;
BEGIN
  IF NOT app.actor_pode_gerir(p_org_id, p_empreendimento_id, p_papel_codigo) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  SELECT id INTO v_papel_id FROM papeis WHERE codigo = p_papel_codigo;
  IF v_papel_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_SCOPE');
  END IF;

  INSERT INTO usuarios (id, email, nome, status)
  VALUES (p_user_id, lower(btrim(p_email)), split_part(p_email, '@', 1), 'convite_pendente')
  ON CONFLICT (id) DO UPDATE
    SET email = excluded.email, status = 'convite_pendente', updated_at = now();

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
  VALUES (p_user_id, p_org_id, p_empreendimento_id, v_papel_id, true)
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO UPDATE
    SET papel_id = excluded.papel_id, ativo = true, updated_at = now();

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION app.conceder_escopo(
  p_target_user_id uuid,
  p_org_id uuid,
  p_empreendimento_id uuid,
  p_papel_codigo papel_codigo
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_papel_id uuid;
BEGIN
  IF NOT app.actor_pode_gerir(p_org_id, p_empreendimento_id, p_papel_codigo) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  SELECT id INTO v_papel_id FROM papeis WHERE codigo = p_papel_codigo;
  IF v_papel_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_SCOPE');
  END IF;

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
  VALUES (p_target_user_id, p_org_id, p_empreendimento_id, v_papel_id, true)
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO UPDATE
    SET papel_id = excluded.papel_id, ativo = true, updated_at = now();

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION app.revogar_escopo(p_escopo_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_empreendimento_id uuid;
  v_papel papel_codigo;
BEGIN
  SELECT e.org_id, e.empreendimento_id, p.codigo
  INTO v_org_id, v_empreendimento_id, v_papel
  FROM escopos_usuario e
  JOIN papeis p ON p.id = e.papel_id
  WHERE e.id = p_escopo_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_SCOPE');
  END IF;

  IF NOT app.actor_pode_gerir(v_org_id, v_empreendimento_id, v_papel) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  UPDATE escopos_usuario
  SET ativo = false, updated_at = now()
  WHERE id = p_escopo_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION app.desativar_usuario(p_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scope record;
BEGIN
  IF p_target_user_id = app.current_user_id() THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED');
  END IF;

  FOR v_scope IN
    SELECT e.org_id, e.empreendimento_id, p.codigo AS papel_codigo
    FROM escopos_usuario e
    JOIN papeis p ON p.id = e.papel_id
    WHERE e.usuario_id = p_target_user_id AND e.ativo = true
  LOOP
    IF NOT app.actor_pode_gerir(
      v_scope.org_id,
      v_scope.empreendimento_id,
      v_scope.papel_codigo
    ) THEN
      RETURN jsonb_build_object('ok', false, 'code', 'OUTSIDE_SCOPE');
    END IF;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM escopos_usuario WHERE usuario_id = p_target_user_id AND ativo = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_SCOPE');
  END IF;

  UPDATE usuarios
  SET status = 'desativado', updated_at = now()
  WHERE id = p_target_user_id;

  UPDATE escopos_usuario
  SET ativo = false, updated_at = now()
  WHERE usuario_id = p_target_user_id;

  DELETE FROM contexto_ativo WHERE usuario_id = p_target_user_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION app.seed_access_management_fixtures()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO usuarios (id, email, nome, status)
  VALUES
    ('cccccccc-cccc-4ccc-8ccc-cccccccccc03', 'admin-alpha@example.test', 'Admin Alpha', 'ativo'),
    ('cccccccc-cccc-4ccc-8ccc-cccccccccc04', 'gestor-alpha@example.test', 'Gestor Alpha', 'ativo'),
    ('cccccccc-cccc-4ccc-8ccc-cccccccccc05', 'target-alpha@example.test', 'Target Alpha', 'ativo')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id)
  SELECT 'cccccccc-cccc-4ccc-8ccc-cccccccccc03', '11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000001'::uuid, p.id
  FROM papeis p WHERE p.codigo = 'org_admin'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO NOTHING;

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id)
  SELECT 'cccccccc-cccc-4ccc-8ccc-cccccccccc04', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', p.id
  FROM papeis p WHERE p.codigo = 'empreendimento_gestor'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO NOTHING;

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id)
  SELECT 'cccccccc-cccc-4ccc-8ccc-cccccccccc05', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', p.id
  FROM papeis p WHERE p.codigo = 'recepcionista'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION app.actor_pode_gerir(uuid, uuid, papel_codigo) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.obter_convite_pendente() FROM PUBLIC;
REVOKE ALL ON FUNCTION app.registrar_convite_pendente(uuid, text, uuid, uuid, papel_codigo) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.conceder_escopo(uuid, uuid, uuid, papel_codigo) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.revogar_escopo(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.desativar_usuario(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.seed_access_management_fixtures() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app.actor_pode_gerir(uuid, uuid, papel_codigo) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.obter_convite_pendente() TO custelo_app;
GRANT EXECUTE ON FUNCTION app.registrar_convite_pendente(uuid, text, uuid, uuid, papel_codigo) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.conceder_escopo(uuid, uuid, uuid, papel_codigo) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.revogar_escopo(uuid) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.desativar_usuario(uuid) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.seed_access_management_fixtures() TO custelo_app;
