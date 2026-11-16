-- 0013 · IP.1 (D20): prestadora, contratos de servico e escopo via contrato.
-- O dado continua do condominio: a RLS das tabelas de dominio nao muda. A prestadora entra
-- no condominio por um escopo com via_contrato_id, que morre quando o contrato encerra.

CREATE TYPE "public"."organizacao_tipo" AS ENUM('contratante', 'prestadora');
CREATE TYPE "public"."contrato_servico_tipo" AS ENUM('portaria', 'vigilancia');
CREATE TYPE "public"."contrato_status" AS ENUM('proposto', 'ativo', 'suspenso', 'encerrado');

ALTER TABLE "organizacoes"
  ADD COLUMN "tipo" "organizacao_tipo" DEFAULT 'contratante' NOT NULL;

CREATE TABLE "contratos_servico" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "prestadora_org_id" uuid NOT NULL REFERENCES "organizacoes"("id") ON DELETE RESTRICT,
  "local_org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "servico" "contrato_servico_tipo" NOT NULL,
  "papeis_permitidos" "papel_codigo"[] NOT NULL,
  "status" "contrato_status" DEFAULT 'proposto' NOT NULL,
  "inicio" date DEFAULT current_date NOT NULL,
  "fim" date,
  "proposto_por" uuid REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  "aceito_por" uuid REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  "aceito_em" timestamptz,
  "encerrado_por" uuid REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  "encerrado_em" timestamptz,
  "motivo" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "contratos_servico_local_fk"
    FOREIGN KEY ("empreendimento_id", "local_org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  -- Contrato nunca da papel de gestao: so recepcionista e auditor.
  CONSTRAINT "contratos_servico_papeis_ck" CHECK (
    cardinality("papeis_permitidos") > 0
    AND "papeis_permitidos" <@ ARRAY['recepcionista', 'auditor']::"papel_codigo"[]
  ),
  CONSTRAINT "contratos_servico_pontas_ck" CHECK ("prestadora_org_id" <> "local_org_id"),
  CONSTRAINT "contratos_servico_periodo_ck" CHECK ("fim" IS NULL OR "fim" >= "inicio"),
  -- Alvo da FK composta de escopos_usuario (o escopo fica no mesmo local do contrato).
  CONSTRAINT "contratos_servico_id_local_uq" UNIQUE ("id", "local_org_id", "empreendimento_id")
);
CREATE INDEX "contratos_servico_prestadora_idx" ON "contratos_servico" ("prestadora_org_id");
CREATE INDEX "contratos_servico_local_idx" ON "contratos_servico" ("local_org_id", "empreendimento_id");
-- Um contrato vivo por prestadora, local e servico.
CREATE UNIQUE INDEX "contratos_servico_vivo_uidx"
  ON "contratos_servico" ("prestadora_org_id", "empreendimento_id", "servico")
  WHERE "status" <> 'encerrado';
CREATE TRIGGER "contratos_servico_tocar" BEFORE UPDATE ON "contratos_servico"
  FOR EACH ROW EXECUTE FUNCTION app.tocar_updated_at();

ALTER TABLE "contratos_servico" ENABLE ROW LEVEL SECURITY;
-- Visivel as duas pontas; escrita so pelas funcoes SECURITY DEFINER abaixo.
CREATE POLICY "contratos_servico_duas_pontas" ON "contratos_servico" FOR SELECT
  USING (
    prestadora_org_id = app.current_org_id()
    OR (
      local_org_id = app.current_org_id()
      AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id())
    )
  );
REVOKE ALL ON "contratos_servico" FROM custelo_app, PUBLIC;
GRANT SELECT ON "contratos_servico" TO custelo_app;

-- Escopo via contrato: nulo = vinculo direto.
ALTER TABLE "escopos_usuario" ADD COLUMN "via_contrato_id" uuid;
ALTER TABLE "escopos_usuario" ADD CONSTRAINT "escopos_usuario_via_contrato_fk"
  FOREIGN KEY ("via_contrato_id", "org_id", "empreendimento_id")
  REFERENCES "contratos_servico" ("id", "local_org_id", "empreendimento_id") ON DELETE RESTRICT;
CREATE INDEX "escopos_usuario_via_contrato_idx" ON "escopos_usuario" ("via_contrato_id");

-- Defesa em profundidade: mesmo um UPDATE direto nao reativa escopo de contrato que nao
-- esta ativo nem da papel fora de papeis_permitidos.
CREATE OR REPLACE FUNCTION app.validar_escopo_via_contrato() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status contrato_status;
  v_permitidos papel_codigo[];
  v_papel papel_codigo;
BEGIN
  IF NEW.via_contrato_id IS NULL OR NEW.ativo = false THEN
    RETURN NEW;
  END IF;

  SELECT c.status, c.papeis_permitidos INTO v_status, v_permitidos
  FROM contratos_servico c WHERE c.id = NEW.via_contrato_id;
  IF v_status IS DISTINCT FROM 'ativo' THEN
    RAISE EXCEPTION 'CONTRATO_INATIVO: escopo via contrato exige contrato ativo'
      USING ERRCODE = '23514';
  END IF;

  SELECT p.codigo INTO v_papel FROM papeis p WHERE p.id = NEW.papel_id;
  IF NOT (v_papel = ANY (v_permitidos)) THEN
    RAISE EXCEPTION 'PAPEL_FORA_DO_CONTRATO: papel % nao permitido pelo contrato', v_papel
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER "escopos_usuario_via_contrato_valido"
  BEFORE INSERT OR UPDATE ON "escopos_usuario"
  FOR EACH ROW EXECUTE FUNCTION app.validar_escopo_via_contrato();

-- Auditoria: evento feito por funcionario via contrato grava prestadora e contrato.
ALTER TABLE "audit_log"
  ADD COLUMN "prestadora_org_id" uuid REFERENCES "organizacoes"("id") ON DELETE RESTRICT,
  ADD COLUMN "contrato_id" uuid REFERENCES "contratos_servico"("id") ON DELETE RESTRICT;
CREATE INDEX "audit_log_contrato_idx" ON "audit_log" ("contrato_id") WHERE "contrato_id" IS NOT NULL;

-- O banco deriva os dois campos do escopo do ator; o app nao consegue forjar nem esquecer.
CREATE OR REPLACE FUNCTION app.audit_log_contrato() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contrato uuid;
  v_prestadora uuid;
BEGIN
  IF NEW.ator_usuario_id IS NOT NULL THEN
    SELECT c.id, c.prestadora_org_id INTO v_contrato, v_prestadora
    FROM escopos_usuario e
    JOIN contratos_servico c ON c.id = e.via_contrato_id
    WHERE e.usuario_id = NEW.ator_usuario_id
      AND e.org_id = NEW.org_id
      AND e.empreendimento_id = NEW.empreendimento_id
      AND e.ativo = true;
    IF FOUND THEN
      NEW.contrato_id := v_contrato;
      NEW.prestadora_org_id := v_prestadora;
      RETURN NEW;
    END IF;
  END IF;

  -- Acao sobre o contrato feita por gestor (aceite, encerramento): contrato_id informado
  -- pelas funcoes; a prestadora sempre vem do contrato, nunca do INSERT.
  IF NEW.contrato_id IS NOT NULL THEN
    SELECT c.prestadora_org_id INTO v_prestadora
    FROM contratos_servico c
    WHERE c.id = NEW.contrato_id
      AND c.local_org_id = NEW.org_id
      AND c.empreendimento_id = NEW.empreendimento_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'CONTRATO_INVALIDO: contrato fora do local do evento' USING ERRCODE = '23514';
    END IF;
    NEW.prestadora_org_id := v_prestadora;
  ELSE
    NEW.prestadora_org_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "audit_log_contrato" BEFORE INSERT ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION app.audit_log_contrato();

-- Gestor direto (sem contrato) com org_admin na organizacao.
CREATE OR REPLACE FUNCTION app.eh_org_admin_direto(p_org_id uuid) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM escopos_usuario e
    JOIN papeis p ON p.id = e.papel_id
    WHERE e.usuario_id = app.current_user_id()
      AND e.org_id = p_org_id
      AND e.ativo = true
      AND e.via_contrato_id IS NULL
      AND p.codigo = 'org_admin'
  );
$$;

-- Nome da prestadora para quem enxerga o contrato (o condominio nao le organizacoes de outra conta).
CREATE OR REPLACE FUNCTION app.prestadora_nome_do_contrato(p_contrato_id uuid) RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.nome
  FROM contratos_servico c
  JOIN organizacoes o ON o.id = c.prestadora_org_id
  WHERE c.id = p_contrato_id
    AND (
      c.prestadora_org_id = app.current_org_id()
      OR (
        c.local_org_id = app.current_org_id()
        AND (app.is_org_scope() OR c.empreendimento_id = app.current_empreendimento_id())
      )
    );
$$;

-- Funcoes do contrato: presas ao usuario da sessao (app.current_user_id()).

CREATE OR REPLACE FUNCTION app.propor_contrato(
  p_local_org_id uuid,
  p_empreendimento_id uuid,
  p_servico contrato_servico_tipo,
  p_papeis_permitidos papel_codigo[],
  p_inicio date DEFAULT current_date,
  p_fim date DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prestadora uuid := app.current_org_id();
  v_id uuid;
BEGIN
  IF v_prestadora IS NULL
     OR NOT EXISTS (SELECT 1 FROM organizacoes o WHERE o.id = v_prestadora AND o.tipo = 'prestadora')
     OR NOT app.eh_org_admin_direto(v_prestadora) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO: so o gestor da prestadora propoe contrato' USING ERRCODE = '42501';
  END IF;

  INSERT INTO contratos_servico (
    prestadora_org_id, local_org_id, empreendimento_id, servico, papeis_permitidos,
    status, inicio, fim, proposto_por
  )
  VALUES (
    v_prestadora, p_local_org_id, p_empreendimento_id, p_servico, p_papeis_permitidos,
    'proposto', coalesce(p_inicio, current_date), p_fim, app.current_user_id()
  )
  RETURNING id INTO v_id;

  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, contrato_id, origem)
  VALUES (p_local_org_id, p_empreendimento_id, app.current_user_id(), 'CONTRATO_PROPOSTO', 'contrato_servico', v_id, v_id, 'web');

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION app.aceitar_contrato(p_contrato_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c contratos_servico%ROWTYPE;
BEGIN
  SELECT * INTO c FROM contratos_servico WHERE id = p_contrato_id FOR UPDATE;
  -- Contrato inexistente e falta de permissao dao o mesmo erro (nao revela existencia).
  IF NOT FOUND OR NOT app.actor_pode_gerir(c.local_org_id, c.empreendimento_id, 'recepcionista') THEN
    RAISE EXCEPTION 'SEM_PERMISSAO: so o gestor do condominio ativa o contrato' USING ERRCODE = '42501';
  END IF;
  IF c.status <> 'proposto' THEN
    RAISE EXCEPTION 'CONTRATO_NAO_PROPOSTO: status atual %', c.status USING ERRCODE = '22023';
  END IF;

  UPDATE contratos_servico
  SET status = 'ativo', aceito_por = app.current_user_id(), aceito_em = now()
  WHERE id = p_contrato_id;

  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, contrato_id, origem)
  VALUES (c.local_org_id, c.empreendimento_id, app.current_user_id(), 'CONTRATO_ACEITO', 'contrato_servico', c.id, c.id, 'web');
END;
$$;

CREATE OR REPLACE FUNCTION app.atribuir_funcionario_contrato(
  p_contrato_id uuid,
  p_usuario_id uuid,
  p_papel papel_codigo
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c contratos_servico%ROWTYPE;
  v_papel_id uuid;
  v_escopo_id uuid;
BEGIN
  SELECT * INTO c FROM contratos_servico WHERE id = p_contrato_id;
  IF NOT FOUND OR NOT app.eh_org_admin_direto(c.prestadora_org_id) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO: so o gestor da prestadora atribui funcionario' USING ERRCODE = '42501';
  END IF;
  IF c.status <> 'ativo' THEN
    RAISE EXCEPTION 'CONTRATO_INATIVO: status atual %', c.status USING ERRCODE = '22023';
  END IF;
  IF NOT (p_papel = ANY (c.papeis_permitidos)) THEN
    RAISE EXCEPTION 'PAPEL_FORA_DO_CONTRATO: papel % nao permitido pelo contrato', p_papel
      USING ERRCODE = '23514';
  END IF;
  -- So funcionario da propria prestadora (vinculo direto e ativo).
  IF NOT EXISTS (
    SELECT 1 FROM escopos_usuario e
    WHERE e.usuario_id = p_usuario_id AND e.org_id = c.prestadora_org_id
      AND e.ativo = true AND e.via_contrato_id IS NULL
  ) THEN
    RAISE EXCEPTION 'FUNCIONARIO_FORA_DA_PRESTADORA' USING ERRCODE = '22023';
  END IF;
  -- Nao sobrescreve vinculo direto nem escopo de outro contrato no mesmo local.
  IF EXISTS (
    SELECT 1 FROM escopos_usuario e
    WHERE e.usuario_id = p_usuario_id AND e.org_id = c.local_org_id
      AND e.empreendimento_id = c.empreendimento_id
      AND e.via_contrato_id IS DISTINCT FROM c.id
  ) THEN
    RAISE EXCEPTION 'ESCOPO_CONFLITANTE: usuario ja tem escopo neste local' USING ERRCODE = '23505';
  END IF;

  SELECT id INTO v_papel_id FROM papeis WHERE codigo = p_papel;

  INSERT INTO escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo, via_contrato_id)
  VALUES (p_usuario_id, c.local_org_id, c.empreendimento_id, v_papel_id, true, c.id)
  ON CONFLICT (usuario_id, org_id, empreendimento_id) DO UPDATE
    SET papel_id = excluded.papel_id, ativo = true, updated_at = now()
  RETURNING id INTO v_escopo_id;

  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, depois, contrato_id, origem)
  VALUES (c.local_org_id, c.empreendimento_id, app.current_user_id(), 'FUNCIONARIO_ATRIBUIDO',
          'escopo_usuario', v_escopo_id, jsonb_build_object('usuario_id', p_usuario_id, 'papel', p_papel), c.id, 'web');

  RETURN v_escopo_id;
END;
$$;

CREATE OR REPLACE FUNCTION app.suspender_funcionario_no_local(
  p_contrato_id uuid,
  p_usuario_id uuid,
  p_motivo text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c contratos_servico%ROWTYPE;
  v_escopo_id uuid;
BEGIN
  SELECT * INTO c FROM contratos_servico WHERE id = p_contrato_id;
  IF NOT FOUND OR NOT app.actor_pode_gerir(c.local_org_id, c.empreendimento_id, 'recepcionista') THEN
    RAISE EXCEPTION 'SEM_PERMISSAO: so o gestor do condominio suspende funcionario' USING ERRCODE = '42501';
  END IF;
  IF coalesce(btrim(p_motivo), '') = '' THEN
    RAISE EXCEPTION 'MOTIVO_OBRIGATORIO' USING ERRCODE = '22023';
  END IF;

  UPDATE escopos_usuario
  SET ativo = false, updated_at = now()
  WHERE via_contrato_id = c.id AND usuario_id = p_usuario_id AND ativo = true
  RETURNING id INTO v_escopo_id;
  IF v_escopo_id IS NULL THEN
    RAISE EXCEPTION 'ESCOPO_NAO_ENCONTRADO' USING ERRCODE = '22023';
  END IF;

  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, motivo, contrato_id, origem)
  VALUES (c.local_org_id, c.empreendimento_id, app.current_user_id(), 'FUNCIONARIO_SUSPENSO',
          'escopo_usuario', v_escopo_id, p_motivo, c.id, 'web');
END;
$$;

CREATE OR REPLACE FUNCTION app.encerrar_contrato(p_contrato_id uuid, p_motivo text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c contratos_servico%ROWTYPE;
BEGIN
  SELECT * INTO c FROM contratos_servico WHERE id = p_contrato_id FOR UPDATE;
  IF NOT FOUND OR NOT (
    app.actor_pode_gerir(c.local_org_id, c.empreendimento_id, 'recepcionista')
    OR app.eh_org_admin_direto(c.prestadora_org_id)
  ) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO: so as pontas do contrato o encerram' USING ERRCODE = '42501';
  END IF;
  IF coalesce(btrim(p_motivo), '') = '' THEN
    RAISE EXCEPTION 'MOTIVO_OBRIGATORIO' USING ERRCODE = '22023';
  END IF;
  IF c.status = 'encerrado' THEN
    RETURN;
  END IF;

  -- Mesma transacao: contrato encerrado e nenhum escopo dele continua ativo.
  UPDATE contratos_servico
  SET status = 'encerrado', encerrado_por = app.current_user_id(), encerrado_em = now(),
      motivo = p_motivo, fim = coalesce(fim, current_date)
  WHERE id = c.id;

  UPDATE escopos_usuario SET ativo = false, updated_at = now()
  WHERE via_contrato_id = c.id AND ativo = true;

  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, motivo, contrato_id, origem)
  VALUES (c.local_org_id, c.empreendimento_id, app.current_user_id(), 'CONTRATO_ENCERRADO',
          'contrato_servico', c.id, p_motivo, c.id, 'web');
END;
$$;

-- list_escopos_acessiveis passa a dizer se o escopo vem de contrato (e de qual prestadora).
-- Escopo de contrato que nao esta ativo some da lista.
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
          'papel_nome', p.nome,
          'via_contrato', e.via_contrato_id IS NOT NULL,
          'prestadora_nome', po.nome,
          'contrato_status', c.status::text
        )
        ORDER BY o.nome, emp.nome NULLS FIRST
      )
      FROM escopos_usuario e
      INNER JOIN organizacoes o ON o.id = e.org_id
      INNER JOIN papeis p ON p.id = e.papel_id
      LEFT JOIN empreendimentos emp
        ON emp.id = e.empreendimento_id
        AND e.empreendimento_id <> '00000000-0000-0000-0000-000000000001'::uuid
      LEFT JOIN contratos_servico c ON c.id = e.via_contrato_id
      LEFT JOIN organizacoes po ON po.id = c.prestadora_org_id
      WHERE e.usuario_id = p_user_id
        AND e.ativo = true
        AND (e.via_contrato_id IS NULL OR c.status = 'ativo')
    ),
    '[]'::jsonb
  );
END;
$$;

-- Permissoes: nada para PUBLIC; o app executa so o que precisa.
REVOKE ALL ON FUNCTION app.validar_escopo_via_contrato() FROM PUBLIC, custelo_app;
REVOKE ALL ON FUNCTION app.audit_log_contrato() FROM PUBLIC, custelo_app;
REVOKE ALL ON FUNCTION app.eh_org_admin_direto(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.prestadora_nome_do_contrato(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.propor_contrato(uuid, uuid, contrato_servico_tipo, papel_codigo[], date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.aceitar_contrato(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.atribuir_funcionario_contrato(uuid, uuid, papel_codigo) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.suspender_funcionario_no_local(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.encerrar_contrato(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app.eh_org_admin_direto(uuid) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.prestadora_nome_do_contrato(uuid) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.propor_contrato(uuid, uuid, contrato_servico_tipo, papel_codigo[], date, date) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.aceitar_contrato(uuid) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.atribuir_funcionario_contrato(uuid, uuid, papel_codigo) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.suspender_funcionario_no_local(uuid, uuid, text) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.encerrar_contrato(uuid, text) TO custelo_app;
