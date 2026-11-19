-- 0016: I5 — recebimento com foto da etiqueta, leitura por IA e sugestão de cadastro.
-- Foto e texto lido são dado pessoal: ficam no bucket privado e em colunas que a
-- retenção (I12) expurga. Nada disso vai para log, Sentry, PostHog ou auditoria.

-- 1) Observação da entrada manual (prancha EntradaManual).
ALTER TABLE "encomendas" ADD COLUMN "observacao" text
  CHECK ("observacao" IS NULL OR length("observacao") <= 280);

-- 2) Configuração da leitura por empreendimento (telas na I11, CFG-006).
ALTER TABLE "empreendimento_config"
  ADD COLUMN "leitura_automatica" boolean DEFAULT true NOT NULL,
  ADD COLUMN "foto_obrigatoria" boolean DEFAULT true NOT NULL,
  ADD COLUMN "leituras_por_dia" smallint DEFAULT 600 NOT NULL
    CHECK ("leituras_por_dia" BETWEEN 0 AND 20000);

-- 3) Foto da etiqueta: uma por encomenda, nunca apagada pelo app (expurgo é da I12).
CREATE TABLE "fotos_etiqueta" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "encomenda_id" uuid NOT NULL,
  "caminho" text NOT NULL CHECK (length("caminho") BETWEEN 10 AND 300),
  "sha256" text NOT NULL CHECK ("sha256" ~ '^[0-9a-f]{64}$'),
  "bytes" integer NOT NULL CHECK ("bytes" BETWEEN 1 AND 1572864),
  "mime" text NOT NULL CHECK ("mime" IN ('image/jpeg', 'image/webp')),
  "enviada_em" timestamptz DEFAULT now() NOT NULL,
  "expurgada_em" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "fotos_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "fotos_id_emp_uq" UNIQUE ("id", "empreendimento_id"),
  CONSTRAINT "fotos_encomenda_fk" FOREIGN KEY ("encomenda_id", "empreendimento_id")
    REFERENCES "encomendas" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "fotos_encomenda_uq" UNIQUE ("encomenda_id")
);
CREATE INDEX "fotos_emp_idx" ON "fotos_etiqueta" ("empreendimento_id", "created_at" DESC);

-- 4) Leitura da etiqueta: o que a IA sugeriu, quanto custou e se o porteiro aceitou.
CREATE TABLE "leituras_etiqueta" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "encomenda_id" uuid,                       -- anulável até o registro
  "provedor" text NOT NULL CHECK (length("provedor") BETWEEN 1 AND 40),
  "modelo" text NOT NULL CHECK (length("modelo") BETWEEN 1 AND 80),
  "versao_prompt" text NOT NULL CHECK (length("versao_prompt") BETWEEN 1 AND 40),
  "latencia_ms" integer NOT NULL CHECK ("latencia_ms" >= 0),
  "resultado" text NOT NULL
    CHECK ("resultado" IN ('ok', 'timeout', 'indisponivel', 'ilegivel', 'limite', 'recusado')),
  "confianca" text NOT NULL CHECK ("confianca" IN ('alta', 'media', 'baixa', 'nenhuma')),
  "unidade_lida" text CHECK ("unidade_lida" IS NULL OR length("unidade_lida") <= 80),
  "nome_lido" text CHECK ("nome_lido" IS NULL OR length("nome_lido") <= 120),
  "unidade_sugerida_id" uuid,
  "pessoa_sugerida_id" uuid,
  "aceita" boolean,
  "tokens_entrada" integer CHECK ("tokens_entrada" IS NULL OR "tokens_entrada" >= 0),
  "tokens_saida" integer CHECK ("tokens_saida" IS NULL OR "tokens_saida" >= 0),
  "custo_micro_usd" integer CHECK ("custo_micro_usd" IS NULL OR "custo_micro_usd" >= 0),
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "leituras_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "leituras_id_emp_uq" UNIQUE ("id", "empreendimento_id"),
  CONSTRAINT "leituras_encomenda_fk" FOREIGN KEY ("encomenda_id", "empreendimento_id")
    REFERENCES "encomendas" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "leituras_unidade_fk" FOREIGN KEY ("unidade_sugerida_id", "empreendimento_id")
    REFERENCES "unidades" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "leituras_pessoa_fk" FOREIGN KEY ("pessoa_sugerida_id", "empreendimento_id")
    REFERENCES "pessoas" ("id", "empreendimento_id") ON DELETE RESTRICT
);
CREATE INDEX "leituras_emp_idx" ON "leituras_etiqueta" ("empreendimento_id", "created_at" DESC);
CREATE INDEX "leituras_encomenda_idx" ON "leituras_etiqueta" ("encomenda_id")
  WHERE "encomenda_id" IS NOT NULL;

-- 5) Sugestão de cadastro: ninguém é cadastrado sozinho; o gestor decide (invariante 6).
CREATE TABLE "sugestoes_cadastro" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "unidade_id" uuid NOT NULL,
  "nome" text NOT NULL CHECK (length(btrim("nome")) BETWEEN 2 AND 120),
  "origem" text NOT NULL CHECK ("origem" IN ('recebimento', 'retirada')),
  "encomenda_id" uuid,
  "status" text DEFAULT 'pendente' NOT NULL CHECK ("status" IN ('pendente', 'aceita', 'descartada')),
  "criado_por" uuid NOT NULL,
  "resolvido_por" uuid,
  "resolvido_em" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "sugestoes_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "sugestoes_id_emp_uq" UNIQUE ("id", "empreendimento_id"),
  CONSTRAINT "sugestoes_unidade_fk" FOREIGN KEY ("unidade_id", "empreendimento_id")
    REFERENCES "unidades" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "sugestoes_encomenda_fk" FOREIGN KEY ("encomenda_id", "empreendimento_id")
    REFERENCES "encomendas" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "sugestoes_resolucao_ck" CHECK (
    ("status" = 'pendente') = ("resolvido_em" IS NULL))
);
CREATE INDEX "sugestoes_emp_idx" ON "sugestoes_cadastro" ("empreendimento_id", "created_at" DESC);
CREATE INDEX "sugestoes_pendentes_idx" ON "sugestoes_cadastro" ("empreendimento_id", "unidade_id")
  WHERE "status" = 'pendente';

-- 6) RLS, toque de updated_at e permissões explícitas por coluna (nunca ON ALL TABLES).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['fotos_etiqueta', 'leituras_etiqueta', 'sugestoes_cadastro'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY %I ON %I FOR ALL
      USING (org_id = app.current_org_id()
             AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()))
      WITH CHECK (org_id = app.current_org_id()
             AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()))$p$,
      t || '_tenant_isolation', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tocar_updated_at()',
      t || '_tocar', t);
    EXECUTE format('REVOKE ALL ON %I FROM custelo_app', t);
  END LOOP;
END $$;

GRANT SELECT, INSERT ON "fotos_etiqueta" TO custelo_app;
GRANT SELECT, INSERT ON "leituras_etiqueta" TO custelo_app;
GRANT UPDATE ("encomenda_id", "aceita") ON "leituras_etiqueta" TO custelo_app;
GRANT SELECT, INSERT ON "sugestoes_cadastro" TO custelo_app;
GRANT UPDATE ("status", "resolvido_por", "resolvido_em") ON "sugestoes_cadastro" TO custelo_app;
-- encomendas.observacao entra no INSERT que o app já tem.

-- 7) Storage (só no Supabase; o Postgres de teste não tem o schema `storage`).
-- Caminho: <org_id>/<empreendimento_id>/<encomenda_id>.<ext>. Sem UPDATE nem DELETE.
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'schema storage ausente: bucket e policies da etiqueta ficam para o Supabase';
    RETURN;
  END IF;
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('etiquetas', 'etiquetas', false, 1572864, '{image/jpeg,image/webp}')
  ON CONFLICT (id) DO NOTHING;

  EXECUTE $p$CREATE POLICY "etiquetas_inserir" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'etiquetas'
      AND (storage.foldername(name))[1] = auth.jwt() ->> 'org_id'
      AND ((storage.foldername(name))[2] = auth.jwt() ->> 'empreendimento_id'
           OR auth.jwt() ->> 'empreendimento_id' = '00000000-0000-0000-0000-000000000001'))$p$;
  EXECUTE $p$CREATE POLICY "etiquetas_ler" ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'etiquetas'
      AND (storage.foldername(name))[1] = auth.jwt() ->> 'org_id'
      AND ((storage.foldername(name))[2] = auth.jwt() ->> 'empreendimento_id'
           OR auth.jwt() ->> 'empreendimento_id' = '00000000-0000-0000-0000-000000000001'))$p$;
END $$;
