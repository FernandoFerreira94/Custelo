-- 0011: I3 — integridade entre tenants, modelo das pranchas e contatos com consentimento.

-- 1) Chaves compostas: todo filho aponta para pai do MESMO empreendimento, e todo empreendimento é da org da linha.
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_id_org_uq" UNIQUE ("id", "org_id");
ALTER TABLE "areas" ADD CONSTRAINT "areas_id_emp_uq" UNIQUE ("id", "empreendimento_id");
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_id_emp_uq" UNIQUE ("id", "empreendimento_id");
ALTER TABLE "pessoas" ADD CONSTRAINT "pessoas_id_emp_uq" UNIQUE ("id", "empreendimento_id");
ALTER TABLE "pontos_recebimento" ADD CONSTRAINT "pontos_id_emp_uq" UNIQUE ("id", "empreendimento_id");

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['areas','unidades','pontos_recebimento','pessoas','vinculos'] LOOP
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (empreendimento_id, org_id) REFERENCES empreendimentos (id, org_id) ON DELETE RESTRICT',
      t, t || '_emp_org_fk');
  END LOOP;
END $$;

ALTER TABLE "areas" ADD CONSTRAINT "areas_parent_mesmo_emp_fk"
  FOREIGN KEY ("parent_id", "empreendimento_id") REFERENCES "areas" ("id", "empreendimento_id") ON DELETE RESTRICT;
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_area_mesmo_emp_fk"
  FOREIGN KEY ("area_id", "empreendimento_id") REFERENCES "areas" ("id", "empreendimento_id") ON DELETE RESTRICT;
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_pessoa_mesmo_emp_fk"
  FOREIGN KEY ("pessoa_id", "empreendimento_id") REFERENCES "pessoas" ("id", "empreendimento_id") ON DELETE RESTRICT;
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_unidade_mesmo_emp_fk"
  FOREIGN KEY ("unidade_id", "empreendimento_id") REFERENCES "unidades" ("id", "empreendimento_id") ON DELETE RESTRICT;

-- 2) Áreas: ordem e árvore sem ciclo.
ALTER TABLE "areas" ADD COLUMN "ordem" integer DEFAULT 0 NOT NULL;

CREATE OR REPLACE FUNCTION app.areas_sem_ciclo() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.parent_id = NEW.id THEN RAISE EXCEPTION 'AREA_CICLO'; END IF;
  IF EXISTS (
    WITH RECURSIVE sobe(id, parent_id) AS (
      SELECT id, parent_id FROM areas WHERE id = NEW.parent_id
      UNION ALL
      SELECT a.id, a.parent_id FROM areas a JOIN sobe s ON a.id = s.parent_id
    ) SELECT 1 FROM sobe WHERE id = NEW.id
  ) THEN
    RAISE EXCEPTION 'AREA_CICLO';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "areas_sem_ciclo" BEFORE INSERT OR UPDATE OF parent_id ON "areas"
  FOR EACH ROW EXECUTE FUNCTION app.areas_sem_ciclo();

-- 3) Unidades: tipo, código normalizado, apelidos, responsável (área comum).
CREATE TYPE "public"."unidade_tipo" AS ENUM ('apartamento','casa','sala','loja','area_comum','outro');
ALTER TABLE "unidades"
  ADD COLUMN "tipo" "unidade_tipo" DEFAULT 'apartamento' NOT NULL,
  ADD COLUMN "numero" text,
  ADD COLUMN "codigo_normalizado" text GENERATED ALWAYS AS (upper(regexp_replace("codigo", '[^[:alnum:]]', '', 'g'))) STORED,
  ADD COLUMN "apelidos" text[] DEFAULT '{}' NOT NULL,
  ADD COLUMN "responsavel_pessoa_id" uuid,
  ADD COLUMN "avisar_responsavel" boolean DEFAULT false NOT NULL;
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_responsavel_mesmo_emp_fk"
  FOREIGN KEY ("responsavel_pessoa_id", "empreendimento_id") REFERENCES "pessoas" ("id", "empreendimento_id") ON DELETE RESTRICT;
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_codigo_nao_vazio" CHECK (length("codigo_normalizado") > 0);
DROP INDEX IF EXISTS "unidades_emp_codigo_uidx";
CREATE UNIQUE INDEX "unidades_emp_codigo_norm_uidx" ON "unidades" ("empreendimento_id", "codigo_normalizado");
CREATE INDEX "unidades_apelidos_gin" ON "unidades" USING gin ("apelidos");

-- 4) Pontos de recebimento: funcionamento.
ALTER TABLE "pontos_recebimento" ADD COLUMN "funcionamento" text;

-- 5) Pessoas: CPF opcional (só dígitos).
ALTER TABLE "pessoas" ADD COLUMN "cpf" text;
ALTER TABLE "pessoas" ADD CONSTRAINT "pessoas_cpf_formato" CHECK ("cpf" IS NULL OR "cpf" ~ '^[0-9]{11}$');
CREATE INDEX "pessoas_emp_nome_idx" ON "pessoas" ("empreendimento_id", lower("nome"));

-- 6) Vínculos: aviso, autorizado, histórico.
ALTER TABLE "vinculos"
  ADD COLUMN "recebe_aviso" boolean DEFAULT false NOT NULL,
  ADD COLUMN "ordem_aviso" smallint DEFAULT 0 NOT NULL,
  ADD COLUMN "relacao" text,
  ADD COLUMN "em_nome_de_pessoa_id" uuid,
  ADD COLUMN "motivo_encerramento" text;
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_em_nome_de_mesmo_emp_fk"
  FOREIGN KEY ("em_nome_de_pessoa_id", "empreendimento_id") REFERENCES "pessoas" ("id", "empreendimento_id") ON DELETE RESTRICT;
-- Dado antigo: encerrado sem fim ganha o fim na data da última alteração (o CHECK abaixo exige).
UPDATE "vinculos" SET "vigencia_fim" = "updated_at" WHERE "status" = 'encerrado' AND "vigencia_fim" IS NULL;
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_vigencia_ordem"
  CHECK ("vigencia_fim" IS NULL OR "vigencia_fim" >= "vigencia_inicio");
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_encerrado_tem_fim"
  CHECK ("status" <> 'encerrado' OR "vigencia_fim" IS NOT NULL);
DROP INDEX IF EXISTS "vinculos_pessoa_unidade_uidx";
CREATE UNIQUE INDEX "vinculos_ativo_pessoa_unidade_uidx" ON "vinculos" ("pessoa_id", "unidade_id") WHERE "status" = 'ativo';
CREATE INDEX "vinculos_unidade_aviso_idx" ON "vinculos" ("empreendimento_id", "unidade_id", "ordem_aviso") WHERE "status" = 'ativo';

-- 7) Contatos com consentimento.
CREATE TYPE "public"."contato_canal" AS ENUM ('whatsapp','email');
CREATE TYPE "public"."contato_status" AS ENUM ('valido','falha','precisa_confirmacao');
CREATE TABLE "contatos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "pessoa_id" uuid NOT NULL,
  "canal" "contato_canal" NOT NULL,
  "valor" text NOT NULL,
  "status" "contato_status" DEFAULT 'precisa_confirmacao' NOT NULL,
  "ordem" smallint DEFAULT 0 NOT NULL,
  "consentimento_em" timestamptz,
  "consentimento_origem" text CHECK ("consentimento_origem" IN ('gestor','opt_in')),
  "consentimento_por" uuid,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "contatos_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id") REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "contatos_pessoa_mesmo_emp_fk" FOREIGN KEY ("pessoa_id", "empreendimento_id") REFERENCES "pessoas" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "contatos_consentimento_completo" CHECK (("consentimento_em" IS NULL) = ("consentimento_origem" IS NULL))
);
CREATE UNIQUE INDEX "contatos_ativo_uidx" ON "contatos" ("empreendimento_id", "pessoa_id", "canal", "valor") WHERE "ativo";
CREATE INDEX "contatos_pessoa_idx" ON "contatos" ("empreendimento_id", "pessoa_id", "ordem");
ALTER TABLE "contatos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contatos_tenant_isolation" ON "contatos" FOR ALL
  USING (org_id = app.current_org_id() AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()))
  WITH CHECK (org_id = app.current_org_id() AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()));
CREATE TRIGGER "contatos_tocar" BEFORE UPDATE ON "contatos" FOR EACH ROW EXECUTE FUNCTION app.tocar_updated_at();

-- 8) Sem DELETE em cadastro (inativar / encerrar). Contatos: só SELECT/INSERT/UPDATE.
REVOKE DELETE ON "areas", "unidades", "pontos_recebimento", "pessoas", "vinculos" FROM custelo_app;
GRANT SELECT, INSERT, UPDATE ON "contatos" TO custelo_app;

-- 9) Novos tipos de vínculo. ADD VALUE fica por último e os valores não são usados neste arquivo
--    (Postgres não deixa usar valor novo de enum na mesma transação).
ALTER TYPE "public"."vinculo_tipo" ADD VALUE IF NOT EXISTS 'inquilino';
ALTER TYPE "public"."vinculo_tipo" ADD VALUE IF NOT EXISTS 'autorizado';
