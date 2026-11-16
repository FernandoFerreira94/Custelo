-- 0014 · IP.3 (D20): codigo curto do local, pareamento do aparelho e limite de tentativas.
-- Sem busca publica por nome: o aparelho so descobre o local cujo codigo ja tem em maos.

CREATE TABLE "locais_codigo" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  -- 6 caracteres sem 0/O/1/I (nao se confundem lidos em voz alta ou impressos).
  "codigo" text NOT NULL CHECK ("codigo" ~ '^[A-HJ-NP-Z2-9]{6}$'),
  "criado_por" uuid REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  "criado_em" timestamptz DEFAULT now() NOT NULL,
  "expira_em" timestamptz NOT NULL,
  "revogado_em" timestamptz,
  "revogado_por" uuid REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  CONSTRAINT "locais_codigo_local_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT,
  CONSTRAINT "locais_codigo_validade_ck" CHECK ("expira_em" > "criado_em")
);
CREATE UNIQUE INDEX "locais_codigo_codigo_uidx" ON "locais_codigo" ("codigo");
CREATE INDEX "locais_codigo_emp_idx" ON "locais_codigo" ("org_id", "empreendimento_id");

CREATE TABLE "aparelhos_pareados" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" uuid NOT NULL,
  "empreendimento_id" uuid NOT NULL,
  "local_codigo_id" uuid NOT NULL REFERENCES "locais_codigo"("id") ON DELETE RESTRICT,
  -- So o hash: o token fica no cookie httpOnly do aparelho e nunca no banco.
  "token_sha256" text NOT NULL CHECK ("token_sha256" ~ '^[0-9a-f]{64}$'),
  "criado_em" timestamptz DEFAULT now() NOT NULL,
  "ultimo_uso_em" timestamptz DEFAULT now() NOT NULL,
  "revogado_em" timestamptz,
  "revogado_por" uuid REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  CONSTRAINT "aparelhos_pareados_local_fk" FOREIGN KEY ("empreendimento_id", "org_id")
    REFERENCES "empreendimentos" ("id", "org_id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "aparelhos_pareados_token_uidx" ON "aparelhos_pareados" ("token_sha256");
CREATE INDEX "aparelhos_pareados_emp_idx" ON "aparelhos_pareados" ("org_id", "empreendimento_id");
CREATE INDEX "aparelhos_pareados_codigo_idx" ON "aparelhos_pareados" ("local_codigo_id");

-- Contador por chave (origem com hash ou codigo digitado). Limite em lugar unico, nunca em memoria.
CREATE TABLE "tentativas_pareamento" (
  "chave" text PRIMARY KEY NOT NULL,
  "janela_inicio" timestamptz DEFAULT now() NOT NULL,
  "contagem" integer DEFAULT 0 NOT NULL
);

ALTER TABLE "locais_codigo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aparelhos_pareados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tentativas_pareamento" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locais_codigo_tenant_isolation" ON "locais_codigo" FOR SELECT
  USING (org_id = app.current_org_id()
         AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()));
CREATE POLICY "aparelhos_pareados_tenant_isolation" ON "aparelhos_pareados" FOR SELECT
  USING (org_id = app.current_org_id()
         AND (app.is_org_scope() OR empreendimento_id = app.current_empreendimento_id()));
-- tentativas_pareamento: sem policy e sem grant. So as funcoes abaixo tocam.

REVOKE ALL ON "locais_codigo", "aparelhos_pareados", "tentativas_pareamento" FROM custelo_app, PUBLIC;
GRANT SELECT ON "locais_codigo", "aparelhos_pareados" TO custelo_app;

-- Conta uma tentativa e diz se ainda esta dentro do limite da janela.
CREATE OR REPLACE FUNCTION app.consumir_tentativa(p_chave text, p_limite integer, p_janela interval)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contagem integer;
BEGIN
  INSERT INTO tentativas_pareamento AS t (chave, janela_inicio, contagem)
  VALUES (p_chave, now(), 1)
  ON CONFLICT (chave) DO UPDATE SET
    contagem = CASE WHEN t.janela_inicio < now() - p_janela THEN 1 ELSE t.contagem + 1 END,
    janela_inicio = CASE WHEN t.janela_inicio < now() - p_janela THEN now() ELSE t.janela_inicio END
  RETURNING contagem INTO v_contagem;
  RETURN v_contagem <= p_limite;
END;
$$;

-- Gestor do condominio gera o codigo do local ativo no contexto (tenant do contexto, nunca do pedido).
CREATE OR REPLACE FUNCTION app.criar_codigo_local(p_codigo text, p_expira_em timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid := app.current_org_id();
  v_emp uuid := app.current_empreendimento_id();
  v_id uuid;
BEGIN
  IF v_org IS NULL OR v_emp IS NULL OR app.is_org_scope()
     OR NOT app.actor_pode_gerir(v_org, v_emp, 'recepcionista') THEN
    RAISE EXCEPTION 'SEM_PERMISSAO: so o gestor do local gera codigo' USING ERRCODE = '42501';
  END IF;
  IF p_expira_em <= now() OR p_expira_em > now() + interval '366 days' THEN
    RAISE EXCEPTION 'VALIDADE_INVALIDA: validade entre agora e um ano' USING ERRCODE = '22023';
  END IF;

  INSERT INTO locais_codigo (org_id, empreendimento_id, codigo, criado_por, expira_em)
  VALUES (v_org, v_emp, p_codigo, app.current_user_id(), p_expira_em)
  RETURNING id INTO v_id;

  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, depois, origem)
  VALUES (v_org, v_emp, app.current_user_id(), 'LOCAL_CODIGO_CRIADO', 'local_codigo', v_id,
          jsonb_build_object('expira_em', p_expira_em), 'web');

  RETURN jsonb_build_object('id', v_id, 'codigo', p_codigo, 'expira_em', p_expira_em);
END;
$$;

CREATE OR REPLACE FUNCTION app.revogar_codigo_local(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  l locais_codigo%ROWTYPE;
BEGIN
  SELECT * INTO l FROM locais_codigo WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR NOT app.actor_pode_gerir(l.org_id, l.empreendimento_id, 'recepcionista') THEN
    RAISE EXCEPTION 'SEM_PERMISSAO: so o gestor do local revoga codigo' USING ERRCODE = '42501';
  END IF;
  IF l.revogado_em IS NOT NULL THEN
    RETURN;
  END IF;

  -- Revogar o codigo impede pareamentos novos; aparelho ja pareado se revoga a parte.
  UPDATE locais_codigo SET revogado_em = now(), revogado_por = app.current_user_id() WHERE id = p_id;

  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, origem)
  VALUES (l.org_id, l.empreendimento_id, app.current_user_id(), 'LOCAL_CODIGO_REVOGADO', 'local_codigo', p_id, 'web');
END;
$$;

-- Chamado antes do login. Resposta igual para codigo inexistente, vencido ou revogado.
-- p_chave_origem e um hash calculado no servidor (nunca o IP puro).
CREATE OR REPLACE FUNCTION app.parear_aparelho(
  p_codigo text,
  p_chave_origem text,
  p_token_sha256 text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  l locais_codigo%ROWTYPE;
  v_nome text;
BEGIN
  IF NOT app.consumir_tentativa('origem:' || p_chave_origem, 10, interval '10 minutes')
     OR NOT app.consumir_tentativa('codigo:' || left(upper(p_codigo), 12), 20, interval '10 minutes') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'MUITAS_TENTATIVAS');
  END IF;

  SELECT * INTO l FROM locais_codigo
  WHERE codigo = upper(p_codigo) AND revogado_em IS NULL AND expira_em > now();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NAO_ENCONTRADO');
  END IF;

  INSERT INTO aparelhos_pareados (org_id, empreendimento_id, local_codigo_id, token_sha256)
  VALUES (l.org_id, l.empreendimento_id, l.id, p_token_sha256);

  SELECT e.nome INTO v_nome FROM empreendimentos e WHERE e.id = l.empreendimento_id;

  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, origem)
  VALUES (l.org_id, l.empreendimento_id, NULL, 'APARELHO_PAREADO', 'local_codigo', l.id, 'sistema');

  -- So o nome publico do local que o aparelho ja conhecia pelo codigo.
  RETURN jsonb_build_object('ok', true, 'local_nome', v_nome);
END;
$$;

-- Aparelho ja pareado lembra o local antes do login (so o nome e o id daquele local).
CREATE OR REPLACE FUNCTION app.local_do_aparelho(p_token_sha256 text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid;
  v_emp uuid;
  v_nome text;
BEGIN
  UPDATE aparelhos_pareados a SET ultimo_uso_em = now()
  WHERE a.token_sha256 = p_token_sha256 AND a.revogado_em IS NULL
  RETURNING a.org_id, a.empreendimento_id INTO v_org, v_emp;
  IF v_emp IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NAO_ENCONTRADO');
  END IF;
  SELECT e.nome INTO v_nome FROM empreendimentos e WHERE e.id = v_emp;
  RETURN jsonb_build_object('ok', true, 'org_id', v_org, 'empreendimento_id', v_emp, 'local_nome', v_nome);
END;
$$;

CREATE OR REPLACE FUNCTION app.revogar_aparelho(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a aparelhos_pareados%ROWTYPE;
BEGIN
  SELECT * INTO a FROM aparelhos_pareados WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR NOT app.actor_pode_gerir(a.org_id, a.empreendimento_id, 'recepcionista') THEN
    RAISE EXCEPTION 'SEM_PERMISSAO: so o gestor do local revoga aparelho' USING ERRCODE = '42501';
  END IF;
  IF a.revogado_em IS NOT NULL THEN
    RETURN;
  END IF;
  UPDATE aparelhos_pareados SET revogado_em = now(), revogado_por = app.current_user_id() WHERE id = p_id;
  INSERT INTO audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, alvo_id, origem)
  VALUES (a.org_id, a.empreendimento_id, app.current_user_id(), 'APARELHO_REVOGADO', 'aparelho', p_id, 'web');
END;
$$;

REVOKE ALL ON FUNCTION app.consumir_tentativa(text, integer, interval) FROM PUBLIC, custelo_app;
REVOKE ALL ON FUNCTION app.criar_codigo_local(text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.revogar_codigo_local(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.parear_aparelho(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.local_do_aparelho(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.revogar_aparelho(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app.criar_codigo_local(text, timestamptz) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.revogar_codigo_local(uuid) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.parear_aparelho(text, text, text) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.local_do_aparelho(text) TO custelo_app;
GRANT EXECUTE ON FUNCTION app.revogar_aparelho(uuid) TO custelo_app;
