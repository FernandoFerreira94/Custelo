-- I2 · Tenancy, identidade e RLS base
-- Tabelas: organizacoes, empreendimentos, usuarios, papeis, escopos_usuario

CREATE SCHEMA IF NOT EXISTS app;

CREATE TYPE "public"."organizacao_status" AS ENUM('ativa', 'suspensa', 'offboarding');
CREATE TYPE "public"."empreendimento_status" AS ENUM('ativo', 'inativo');
CREATE TYPE "public"."usuario_status" AS ENUM('ativo', 'desativado', 'convite_pendente');
CREATE TYPE "public"."papel_codigo" AS ENUM(
  'platform_super_admin',
  'org_admin',
  'empreendimento_gestor',
  'recepcionista',
  'auditor'
);

CREATE OR REPLACE FUNCTION app.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_org_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.current_empreendimento_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_empreendimento_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_user_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.is_org_scope()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT app.current_empreendimento_id() = '00000000-0000-0000-0000-000000000001'::uuid
$$;

CREATE TABLE "organizacoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome" text NOT NULL,
  "slug" text NOT NULL,
  "status" "organizacao_status" DEFAULT 'ativa' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "organizacoes_slug_uidx" ON "organizacoes" ("slug");

CREATE TABLE "empreendimentos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE restrict,
  "empreendimento_id" uuid NOT NULL,
  "nome" text NOT NULL,
  "slug" text NOT NULL,
  "status" "empreendimento_status" DEFAULT 'ativo' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "empreendimentos_empreendimento_id_idx" ON "empreendimentos" ("empreendimento_id");
CREATE INDEX "empreendimentos_org_id_idx" ON "empreendimentos" ("org_id");
CREATE UNIQUE INDEX "empreendimentos_org_slug_uidx" ON "empreendimentos" ("org_id", "slug");

CREATE OR REPLACE FUNCTION app.sync_empreendimento_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.empreendimento_id IS NULL
    OR NEW.empreendimento_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
    NEW.empreendimento_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "empreendimentos_sync_empreendimento_id"
  BEFORE INSERT ON "empreendimentos"
  FOR EACH ROW
  EXECUTE FUNCTION app.sync_empreendimento_id();

CREATE TABLE "usuarios" (
  "id" uuid PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "nome" text NOT NULL,
  "status" "usuario_status" DEFAULT 'convite_pendente' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "papeis" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "codigo" "papel_codigo" NOT NULL,
  "nome" text NOT NULL,
  "descricao" text,
  "nivel" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "papeis_codigo_uidx" ON "papeis" ("codigo");

CREATE TABLE "escopos_usuario" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "usuario_id" uuid NOT NULL REFERENCES "usuarios"("id") ON DELETE cascade,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE cascade,
  "empreendimento_id" uuid NOT NULL,
  "papel_id" uuid NOT NULL REFERENCES "papeis"("id") ON DELETE restrict,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "escopos_usuario_empreendimento_id_idx" ON "escopos_usuario" ("empreendimento_id");
CREATE INDEX "escopos_usuario_org_id_idx" ON "escopos_usuario" ("org_id");
CREATE INDEX "escopos_usuario_usuario_id_idx" ON "escopos_usuario" ("usuario_id");
CREATE UNIQUE INDEX "escopos_usuario_scope_uidx" ON "escopos_usuario" ("usuario_id", "org_id", "empreendimento_id");

-- RLS
ALTER TABLE "organizacoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "empreendimentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "papeis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "escopos_usuario" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizacoes_tenant_isolation"
  ON "organizacoes"
  FOR ALL
  USING (id = app.current_org_id())
  WITH CHECK (id = app.current_org_id());

CREATE POLICY "empreendimentos_tenant_isolation"
  ON "empreendimentos"
  FOR ALL
  USING (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR id = app.current_empreendimento_id()
    )
  )
  WITH CHECK (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR id = app.current_empreendimento_id()
    )
  );

CREATE POLICY "usuarios_self_or_org"
  ON "usuarios"
  FOR ALL
  USING (
    id = app.current_user_id()
    OR EXISTS (
      SELECT 1
      FROM escopos_usuario e
      WHERE e.usuario_id = usuarios.id
        AND e.org_id = app.current_org_id()
        AND e.ativo = true
    )
  )
  WITH CHECK (id = app.current_user_id());

CREATE POLICY "papeis_read_all"
  ON "papeis"
  FOR SELECT
  USING (true);

CREATE POLICY "escopos_usuario_tenant_isolation"
  ON "escopos_usuario"
  FOR ALL
  USING (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
      OR empreendimento_id = '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  WITH CHECK (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
      OR empreendimento_id = '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

-- Papeis base (auth-rbac)
INSERT INTO "papeis" ("codigo", "nome", "descricao", "nivel") VALUES
  ('platform_super_admin', 'Super Admin', 'Plataforma Webcodeff', 'platform'),
  ('org_admin', 'Administrador da Organizacao', 'Escopo da conta', 'org'),
  ('empreendimento_gestor', 'Gestor do Empreendimento', 'Escopo do empreendimento', 'empreendimento'),
  ('recepcionista', 'Recepcionista / Porteiro', 'Operacao do empreendimento', 'empreendimento'),
  ('auditor', 'Auditor / Consulta', 'Leitura concedida', 'read');

-- Role da aplicacao (CI cria; Supabase ja possui custelo_app)
DO $$
BEGIN
  CREATE ROLE custelo_app NOINHERIT;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

GRANT USAGE ON SCHEMA public TO custelo_app;
GRANT USAGE ON SCHEMA app TO custelo_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO custelo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO custelo_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO custelo_app;

-- CI roda como postgres e faz SET ROLE custelo_app nos testes
DO $$
BEGIN
  GRANT custelo_app TO postgres;
EXCEPTION
  WHEN undefined_object THEN NULL;
END
$$;

DO $$
BEGIN
  GRANT custelo_app TO custelo_app;
EXCEPTION
  WHEN undefined_object THEN NULL;
END
$$;

-- Seed deterministico para testes RLS (SECURITY DEFINER — bypass controlado)
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
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id)
  SELECT 'aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', p.id
  FROM papeis p WHERE p.codigo = 'recepcionista'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO NOTHING;

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id)
  SELECT 'bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', p.id
  FROM papeis p WHERE p.codigo = 'recepcionista'
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION app.seed_rls_fixtures() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.seed_rls_fixtures() TO custelo_app;
