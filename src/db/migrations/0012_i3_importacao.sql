-- 0012: I3 — importação de cadastros por planilha (conferir antes de gravar).
-- O arquivo original NÃO é guardado: só as linhas já normalizadas (nota LGPD de 04/11).

CREATE TYPE "public"."importacao_cadastro" AS ENUM ('unidades','moradores','lojistas','funcionarios','autorizados','areas_comuns');
CREATE TYPE "public"."importacao_status" AS ENUM ('conferindo','confirmada','cancelada','desfeita');
CREATE TYPE "public"."importacao_situacao" AS ENUM ('ok','aviso','erro','duplicado','ignorada');
CREATE TYPE "public"."importacao_decisao" AS ENUM ('criar','atualizar','ignorar');

CREATE TABLE "importacoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "cadastro" "importacao_cadastro" NOT NULL,
  "arquivo_nome" text NOT NULL,
  "linhas_total" integer NOT NULL CHECK ("linhas_total" >= 0),
  "status" "importacao_status" DEFAULT 'conferindo' NOT NULL,
  "criado_por" uuid NOT NULL,
  "confirmado_por" uuid,
  "confirmado_em" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "importacoes_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "importacoes_id_emp_uq" UNIQUE ("id", "empreendimento_id")
);
CREATE INDEX "importacoes_emp_idx" ON "importacoes" ("empreendimento_id", "created_at" DESC);

CREATE TABLE "importacao_linhas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "importacao_id" uuid NOT NULL,
  "numero_linha" integer NOT NULL CHECK ("numero_linha" >= 1),
  "dados" jsonb NOT NULL,
  "situacao" "importacao_situacao" NOT NULL,
  "problemas" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "decisao" "importacao_decisao",
  "registro_id" uuid,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "importacao_linhas_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "importacao_linhas_importacao_mesmo_emp_fk" FOREIGN KEY ("importacao_id", "empreendimento_id")
    REFERENCES "importacoes" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "importacao_linhas_id_emp_uq" UNIQUE ("id", "empreendimento_id")
);
CREATE UNIQUE INDEX "importacao_linhas_numero_uidx" ON "importacao_linhas" ("importacao_id", "numero_linha");
CREATE INDEX "importacao_linhas_emp_idx" ON "importacao_linhas" ("empreendimento_id", "created_at" DESC);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['importacoes','importacao_linhas'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL
         USING (org_id = app.current_org_id()
                AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()))
         WITH CHECK (org_id = app.current_org_id()
                AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()))',
      t || '_tenant_isolation', t);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tocar_updated_at()',
      t || '_tocar', t);
    EXECUTE format('REVOKE ALL ON %I FROM custelo_app', t);
    -- DELETE nunca: o lote se desfaz inativando o que criou, não apagando.
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON %I TO custelo_app', t);
  END LOOP;
END $$;
