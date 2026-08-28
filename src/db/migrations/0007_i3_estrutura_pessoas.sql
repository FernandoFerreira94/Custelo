-- I3: estrutura fisica e pessoas — tabelas de dominio com RLS.

CREATE TYPE "public"."vinculo_tipo" AS ENUM('titular', 'morador', 'dependente');
CREATE TYPE "public"."vinculo_status" AS ENUM('ativo', 'encerrado');

ALTER TABLE "empreendimentos"
  ADD COLUMN IF NOT EXISTS "rotulo_camada_intermediaria" text NOT NULL DEFAULT 'Bloco';

CREATE TABLE "areas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE restrict,
  "empreendimento_id" uuid NOT NULL REFERENCES "empreendimentos"("id") ON DELETE restrict,
  "parent_id" uuid,
  "nome" text NOT NULL,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "areas_empreendimento_id_idx" ON "areas" ("empreendimento_id");
CREATE INDEX "areas_org_id_idx" ON "areas" ("org_id");
CREATE INDEX "areas_parent_id_idx" ON "areas" ("parent_id");

ALTER TABLE "areas"
  ADD CONSTRAINT "areas_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "areas"("id") ON DELETE set null;

CREATE TABLE "unidades" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE restrict,
  "empreendimento_id" uuid NOT NULL REFERENCES "empreendimentos"("id") ON DELETE restrict,
  "area_id" uuid REFERENCES "areas"("id") ON DELETE set null,
  "codigo" text NOT NULL,
  "nome" text,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "unidades_empreendimento_id_idx" ON "unidades" ("empreendimento_id");
CREATE INDEX "unidades_org_id_idx" ON "unidades" ("org_id");
CREATE INDEX "unidades_area_id_idx" ON "unidades" ("area_id");
CREATE UNIQUE INDEX "unidades_emp_codigo_uidx" ON "unidades" ("empreendimento_id", "codigo");

CREATE TABLE "pontos_recebimento" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE restrict,
  "empreendimento_id" uuid NOT NULL REFERENCES "empreendimentos"("id") ON DELETE restrict,
  "nome" text NOT NULL,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "pontos_recebimento_empreendimento_id_idx" ON "pontos_recebimento" ("empreendimento_id");
CREATE INDEX "pontos_recebimento_org_id_idx" ON "pontos_recebimento" ("org_id");

CREATE TABLE "pessoas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE restrict,
  "empreendimento_id" uuid NOT NULL REFERENCES "empreendimentos"("id") ON DELETE restrict,
  "nome" text NOT NULL,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "pessoas_empreendimento_id_idx" ON "pessoas" ("empreendimento_id");
CREATE INDEX "pessoas_org_id_idx" ON "pessoas" ("org_id");

CREATE TABLE "vinculos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE restrict,
  "empreendimento_id" uuid NOT NULL REFERENCES "empreendimentos"("id") ON DELETE restrict,
  "pessoa_id" uuid NOT NULL REFERENCES "pessoas"("id") ON DELETE restrict,
  "unidade_id" uuid NOT NULL REFERENCES "unidades"("id") ON DELETE restrict,
  "tipo" "vinculo_tipo" NOT NULL,
  "status" "vinculo_status" DEFAULT 'ativo' NOT NULL,
  "vigencia_inicio" timestamptz DEFAULT now() NOT NULL,
  "vigencia_fim" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "vinculos_empreendimento_id_idx" ON "vinculos" ("empreendimento_id");
CREATE INDEX "vinculos_org_id_idx" ON "vinculos" ("org_id");
CREATE INDEX "vinculos_pessoa_id_idx" ON "vinculos" ("pessoa_id");
CREATE INDEX "vinculos_unidade_id_idx" ON "vinculos" ("unidade_id");
CREATE UNIQUE INDEX "vinculos_pessoa_unidade_uidx" ON "vinculos" ("pessoa_id", "unidade_id");

-- RLS
ALTER TABLE "areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "unidades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pontos_recebimento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pessoas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vinculos" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "areas_tenant_isolation"
  ON "areas"
  FOR ALL
  USING (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  )
  WITH CHECK (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  );

CREATE POLICY "unidades_tenant_isolation"
  ON "unidades"
  FOR ALL
  USING (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  )
  WITH CHECK (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  );

CREATE POLICY "pontos_recebimento_tenant_isolation"
  ON "pontos_recebimento"
  FOR ALL
  USING (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  )
  WITH CHECK (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  );

CREATE POLICY "pessoas_tenant_isolation"
  ON "pessoas"
  FOR ALL
  USING (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  )
  WITH CHECK (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  );

CREATE POLICY "vinculos_tenant_isolation"
  ON "vinculos"
  FOR ALL
  USING (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  )
  WITH CHECK (
    org_id = app.current_org_id()
    AND (
      app.is_org_scope()
      OR empreendimento_id = app.current_empreendimento_id()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON "areas" TO custelo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "unidades" TO custelo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "pontos_recebimento" TO custelo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "pessoas" TO custelo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "vinculos" TO custelo_app;
