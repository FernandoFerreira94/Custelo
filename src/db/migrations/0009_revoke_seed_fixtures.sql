-- Fixtures de teste (seed_*) sao SECURITY DEFINER e ignoram RLS.
-- O role da aplicacao nao pode chama-las: em producao elas criariam org,
-- usuario e escopo ficticios. Os testes RLS chamam como postgres (dono).
REVOKE EXECUTE ON FUNCTION app.seed_rls_fixtures() FROM custelo_app, PUBLIC;
REVOKE EXECUTE ON FUNCTION app.seed_convite_pendente_fixture() FROM custelo_app, PUBLIC;
REVOKE EXECUTE ON FUNCTION app.seed_access_management_fixtures() FROM custelo_app, PUBLIC;
