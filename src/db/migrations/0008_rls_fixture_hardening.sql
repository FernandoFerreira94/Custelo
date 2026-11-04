-- Hardening de fixtures RLS: re-seed idempotente entre execucoes de teste.

CREATE OR REPLACE FUNCTION app.seed_rls_fixtures()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO organizacoes (id, nome, slug)
  VALUES
    ('11111111-1111-4111-8111-111111111111', 'Org Alpha', 'org-alpha'),
    ('22222222-2222-4222-8222-222222222222', 'Org Beta', 'org-beta')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO empreendimentos (id, org_id, empreendimento_id, nome, slug)
  VALUES
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Emp Alpha', 'emp-alpha'),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Emp Beta', 'emp-beta')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO usuarios (id, email, nome, status)
  VALUES
    ('aaaaaaaa-0000-4000-8000-000000000001', 'alpha@example.test', 'Usuario Alpha', 'ativo'),
    ('bbbbbbbb-0000-4000-8000-000000000002', 'beta@example.test', 'Usuario Beta', 'ativo')
  ON CONFLICT (id) DO UPDATE
    SET status = 'ativo', updated_at = now();

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
  SELECT 'aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', p.id, true
  FROM papeis p WHERE p.codigo = 'recepcionista'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO UPDATE
    SET papel_id = excluded.papel_id, ativo = true, updated_at = now();

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
  SELECT 'bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', p.id, true
  FROM papeis p WHERE p.codigo = 'recepcionista'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO UPDATE
    SET papel_id = excluded.papel_id, ativo = true, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION app.seed_rls_fixtures() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.seed_rls_fixtures() TO custelo_app;

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
  ON CONFLICT (id) DO UPDATE
    SET status = 'ativo', updated_at = now();

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
  SELECT 'cccccccc-cccc-4ccc-8ccc-cccccccccc03', '11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000001'::uuid, p.id, true
  FROM papeis p WHERE p.codigo = 'org_admin'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO UPDATE
    SET papel_id = excluded.papel_id, ativo = true, updated_at = now();

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
  SELECT 'cccccccc-cccc-4ccc-8ccc-cccccccccc04', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', p.id, true
  FROM papeis p WHERE p.codigo = 'empreendimento_gestor'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO UPDATE
    SET papel_id = excluded.papel_id, ativo = true, updated_at = now();

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
  SELECT 'cccccccc-cccc-4ccc-8ccc-cccccccccc05', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', p.id, true
  FROM papeis p WHERE p.codigo = 'recepcionista'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO UPDATE
    SET papel_id = excluded.papel_id, ativo = true, updated_at = now();

  UPDATE escopos_usuario e
  SET ativo = true, updated_at = now()
  FROM papeis p
  WHERE e.usuario_id = 'aaaaaaaa-0000-4000-8000-000000000001'
    AND e.org_id = '11111111-1111-4111-8111-111111111111'
    AND e.empreendimento_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    AND e.papel_id = p.id
    AND p.codigo = 'recepcionista';

  UPDATE usuarios
  SET status = 'ativo', updated_at = now()
  WHERE id = 'aaaaaaaa-0000-4000-8000-000000000001';
END;
$$;

REVOKE ALL ON FUNCTION app.seed_access_management_fixtures() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.seed_access_management_fixtures() TO custelo_app;
