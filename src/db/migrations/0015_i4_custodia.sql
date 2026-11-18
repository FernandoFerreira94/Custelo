-- 0015: I4 — cadeia de custódia. Evento append-only; o estado da encomenda só muda por evento.

CREATE TYPE "encomenda_estado" AS ENUM (
  'RECEBIDA', 'IDENTIFICADA', 'NAO_IDENTIFICADA', 'AGUARDANDO_NOTIFICACAO', 'NOTIFICADA',
  'FALHA_NOTIFICACAO', 'RETIRADA', 'DEVOLVIDA', 'CANCELADA'
);

-- 1) Configuração por empreendimento (prazos da prancha CFG-005). I7 e I11 acrescentam colunas.
CREATE TABLE "empreendimento_config" (
  "empreendimento_id" uuid PRIMARY KEY NOT NULL,
  "org_id" uuid NOT NULL,
  "fuso" text DEFAULT 'America/Sao_Paulo' NOT NULL,
  "prazo_lembrete_dias" smallint DEFAULT 2 NOT NULL CHECK ("prazo_lembrete_dias" BETWEEN 1 AND 60),
  "prazo_lembrete_ligado" boolean DEFAULT true NOT NULL,
  "prazo_atraso_dias" smallint DEFAULT 7 NOT NULL CHECK ("prazo_atraso_dias" BETWEEN 1 AND 90),
  "prazo_atraso_ligado" boolean DEFAULT true NOT NULL,
  "prazo_devolucao_dias" smallint DEFAULT 30 NOT NULL CHECK ("prazo_devolucao_dias" BETWEEN 1 AND 365),
  "prazo_devolucao_ligado" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "emp_config_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT
);
INSERT INTO "empreendimento_config" ("empreendimento_id", "org_id")
  SELECT "id", "org_id" FROM "empreendimentos" ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION app.criar_config_empreendimento() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, app AS $$
BEGIN
  INSERT INTO empreendimento_config (empreendimento_id, org_id) VALUES (NEW.id, NEW.org_id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "empreendimentos_criar_config" AFTER INSERT ON "empreendimentos"
  FOR EACH ROW EXECUTE FUNCTION app.criar_config_empreendimento();

-- 2) Locais de guarda (prateleiras) de cada ponto de recebimento.
CREATE TABLE "locais_guarda" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "ponto_id" uuid NOT NULL,
  "codigo" text NOT NULL CHECK (length(btrim("codigo")) BETWEEN 1 AND 20),
  "capacidade" smallint CHECK ("capacidade" IS NULL OR "capacidade" BETWEEN 1 AND 999),
  "volume_grande" boolean DEFAULT false NOT NULL,
  "ordem" smallint DEFAULT 0 NOT NULL,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "locais_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "locais_ponto_fk" FOREIGN KEY ("ponto_id", "empreendimento_id")
    REFERENCES "pontos_recebimento" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "locais_id_emp_uq" UNIQUE ("id", "empreendimento_id")
);
CREATE UNIQUE INDEX "locais_codigo_uq" ON "locais_guarda" ("ponto_id", upper(btrim("codigo"))) WHERE "ativo";

-- 3) Encomendas: estado materializado. Só nasce por INSERT e só muda por evento.
CREATE TABLE "encomendas" (
  "id" uuid PRIMARY KEY NOT NULL,                 -- UUIDv7 de quem registra (cliente na I5/I6)
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "estado" "encomenda_estado" DEFAULT 'RECEBIDA' NOT NULL,
  "versao" integer DEFAULT 0 NOT NULL,
  "unidade_id" uuid,
  "pessoa_id" uuid,
  "nome_destinatario" text,                       -- quando a pessoa não é cadastrada (fica na unidade)
  "ponto_id" uuid,
  "local_guarda_id" uuid,
  "codigo_curto" text NOT NULL CHECK ("codigo_curto" ~ '^[0-9A-Z]{4}$'),
  "transportadora" text,
  "rastreio" text,
  "volumes" smallint DEFAULT 1 NOT NULL CHECK ("volumes" BETWEEN 1 AND 99),
  "porte" text CHECK ("porte" IN ('envelope', 'pequena', 'media', 'grande')),
  "excepcional" text CHECK ("excepcional" IN ('perecivel', 'volume_grande', 'outro')),
  "origem" text NOT NULL CHECK ("origem" IN ('online', 'offline')),
  "ocorrido_em" timestamptz NOT NULL,             -- relógio do aparelho
  "registrado_em" timestamptz DEFAULT now() NOT NULL, -- relógio do servidor
  "recebido_por" uuid NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "encomendas_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "encomendas_id_emp_uq" UNIQUE ("id", "empreendimento_id"),
  CONSTRAINT "encomendas_unidade_fk" FOREIGN KEY ("unidade_id", "empreendimento_id")
    REFERENCES "unidades" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "encomendas_pessoa_fk" FOREIGN KEY ("pessoa_id", "empreendimento_id")
    REFERENCES "pessoas" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "encomendas_ponto_fk" FOREIGN KEY ("ponto_id", "empreendimento_id")
    REFERENCES "pontos_recebimento" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "encomendas_local_fk" FOREIGN KEY ("local_guarda_id", "empreendimento_id")
    REFERENCES "locais_guarda" ("id", "empreendimento_id") ON DELETE RESTRICT,
  -- invariante do módulo: tem unidade destino ou está explicitamente sem identificação
  CONSTRAINT "encomendas_destino_ck" CHECK (
    "unidade_id" IS NOT NULL OR "estado" IN ('RECEBIDA', 'NAO_IDENTIFICADA', 'DEVOLVIDA', 'CANCELADA'))
);
CREATE INDEX "encomendas_ativas_idx" ON "encomendas" ("empreendimento_id", "ocorrido_em" DESC)
  WHERE "estado" NOT IN ('RETIRADA', 'DEVOLVIDA', 'CANCELADA');
CREATE INDEX "encomendas_unidade_ativas_idx" ON "encomendas" ("empreendimento_id", "unidade_id")
  WHERE "estado" NOT IN ('RETIRADA', 'DEVOLVIDA', 'CANCELADA');
CREATE INDEX "encomendas_local_ativas_idx" ON "encomendas" ("local_guarda_id")
  WHERE "estado" NOT IN ('RETIRADA', 'DEVOLVIDA', 'CANCELADA');
CREATE INDEX "encomendas_lista_idx" ON "encomendas" ("empreendimento_id", "created_at" DESC, "id");
CREATE INDEX "encomendas_codigo_idx" ON "encomendas" ("empreendimento_id", "codigo_curto");

CREATE OR REPLACE FUNCTION app.encomenda_nasce() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.estado := 'RECEBIDA';
  NEW.versao := 0;
  NEW.unidade_id := NULL;
  NEW.pessoa_id := NULL;
  NEW.nome_destinatario := NULL;
  NEW.local_guarda_id := NULL;
  NEW.registrado_em := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER "encomendas_nasce" BEFORE INSERT ON "encomendas"
  FOR EACH ROW EXECUTE FUNCTION app.encomenda_nasce();
CREATE TRIGGER "encomendas_tocar" BEFORE UPDATE ON "encomendas"
  FOR EACH ROW EXECUTE FUNCTION app.tocar_updated_at();
CREATE TRIGGER "encomendas_sem_delete" BEFORE DELETE ON "encomendas"
  FOR EACH ROW EXECUTE FUNCTION app.bloquear_alteracao();
CREATE TRIGGER "encomendas_sem_truncate" BEFORE TRUNCATE ON "encomendas"
  FOR EACH STATEMENT EXECUTE FUNCTION app.bloquear_alteracao();

-- 4) Eventos de custódia: append-only.
CREATE TABLE "custody_events" (
  "id" uuid PRIMARY KEY NOT NULL,                 -- UUIDv7 = chave de idempotência
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "encomenda_id" uuid NOT NULL,
  "sequencia" integer NOT NULL CHECK ("sequencia" >= 1),
  "tipo" text NOT NULL CHECK ("tipo" ~ '^[A-Z_]{3,60}$'),
  "estado_anterior" "encomenda_estado",
  "estado_novo" "encomenda_estado" NOT NULL,
  "dados" jsonb DEFAULT '{}'::jsonb NOT NULL,      -- { de: {...}, para: {...}, ...extras sem dado sensível }
  "motivo" text CHECK ("motivo" IS NULL OR length(btrim("motivo")) >= 10),
  "ator_tipo" text NOT NULL CHECK ("ator_tipo" IN ('usuario', 'sistema')),
  "ator_usuario_id" uuid,
  "origem" text NOT NULL CHECK ("origem" IN ('online', 'offline')),
  "dispositivo_id" text,
  "ocorrido_em" timestamptz NOT NULL,
  "registrado_em" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "ce_emp_org_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "ce_encomenda_fk" FOREIGN KEY ("encomenda_id", "empreendimento_id")
    REFERENCES "encomendas" ("id", "empreendimento_id") ON DELETE RESTRICT,
  CONSTRAINT "ce_sequencia_uq" UNIQUE ("encomenda_id", "sequencia"),
  CONSTRAINT "ce_ator_ck" CHECK (("ator_tipo" = 'usuario') = ("ator_usuario_id" IS NOT NULL))
);
CREATE INDEX "ce_emp_idx" ON "custody_events" ("empreendimento_id", "registrado_em" DESC);

CREATE OR REPLACE FUNCTION app.aplicar_evento_custodia() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, app AS $$
DECLARE
  atual record;
  para jsonb := COALESCE(NEW.dados -> 'para', '{}'::jsonb);
BEGIN
  -- tenant primeiro: não revela nada de outro empreendimento
  IF NEW.org_id IS DISTINCT FROM app.current_org_id()
     OR NOT (app.is_org_scope() OR NEW.empreendimento_id = app.current_empreendimento_id()) THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT estado, versao INTO atual FROM encomendas
   WHERE id = NEW.encomenda_id AND empreendimento_id = NEW.empreendimento_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ENCOMENDA_INEXISTENTE' USING ERRCODE = '23503';
  END IF;
  IF NEW.sequencia <> atual.versao + 1 THEN
    RAISE EXCEPTION 'VERSAO_DIVERGENTE' USING ERRCODE = '40001';
  END IF;
  IF NEW.estado_anterior IS DISTINCT FROM (CASE WHEN atual.versao = 0 THEN NULL ELSE atual.estado END) THEN
    RAISE EXCEPTION 'ESTADO_DIVERGENTE' USING ERRCODE = '40001';
  END IF;
  IF atual.estado IN ('RETIRADA', 'DEVOLVIDA', 'CANCELADA') AND (
       NEW.estado_novo <> atual.estado
       OR NEW.tipo NOT IN ('RETIRADA_CORRIGIDA', 'DEVOLUCAO_CORRIGIDA')) THEN
    RAISE EXCEPTION 'TRANSICAO_PROIBIDA' USING ERRCODE = '23514';
  END IF;

  NEW.registrado_em := now();

  UPDATE encomendas SET
    estado = NEW.estado_novo,
    versao = NEW.sequencia,
    unidade_id = CASE WHEN para ? 'unidade_id' THEN (para ->> 'unidade_id')::uuid ELSE unidade_id END,
    pessoa_id = CASE WHEN para ? 'pessoa_id' THEN (para ->> 'pessoa_id')::uuid ELSE pessoa_id END,
    nome_destinatario = CASE WHEN para ? 'nome_destinatario' THEN para ->> 'nome_destinatario' ELSE nome_destinatario END,
    local_guarda_id = CASE WHEN para ? 'local_guarda_id' THEN (para ->> 'local_guarda_id')::uuid ELSE local_guarda_id END,
    ponto_id = CASE WHEN para ? 'ponto_id' THEN (para ->> 'ponto_id')::uuid ELSE ponto_id END
  WHERE id = NEW.encomenda_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "custody_events_aplicar" BEFORE INSERT ON "custody_events"
  FOR EACH ROW EXECUTE FUNCTION app.aplicar_evento_custodia();
CREATE TRIGGER "custody_events_append_only" BEFORE UPDATE OR DELETE ON "custody_events"
  FOR EACH ROW EXECUTE FUNCTION app.bloquear_alteracao();
CREATE TRIGGER "custody_events_sem_truncate" BEFORE TRUNCATE ON "custody_events"
  FOR EACH STATEMENT EXECUTE FUNCTION app.bloquear_alteracao();

-- 5) RLS e permissões explícitas (nunca ON ALL TABLES).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['empreendimento_config', 'locais_guarda', 'encomendas', 'custody_events'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($p$CREATE POLICY %I ON %I FOR ALL
      USING (org_id = app.current_org_id()
             AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()))
      WITH CHECK (org_id = app.current_org_id()
             AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()))$p$,
      t || '_tenant_isolation', t);
    EXECUTE format('REVOKE ALL ON %I FROM custelo_app', t);
  END LOOP;
END $$;
CREATE TRIGGER "locais_tocar" BEFORE UPDATE ON "locais_guarda"
  FOR EACH ROW EXECUTE FUNCTION app.tocar_updated_at();
CREATE TRIGGER "emp_config_tocar" BEFORE UPDATE ON "empreendimento_config"
  FOR EACH ROW EXECUTE FUNCTION app.tocar_updated_at();

GRANT SELECT, UPDATE ON "empreendimento_config" TO custelo_app;
GRANT SELECT, INSERT, UPDATE ON "locais_guarda" TO custelo_app;
GRANT SELECT, INSERT ON "encomendas", "custody_events" TO custelo_app;
REVOKE EXECUTE ON FUNCTION app.aplicar_evento_custodia(), app.criar_config_empreendimento() FROM PUBLIC;
