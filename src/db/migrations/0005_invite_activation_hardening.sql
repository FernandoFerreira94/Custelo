-- AUTH-002: endurece o aceite de convite e o fixture negativo de RLS.
REVOKE UPDATE ON usuarios FROM custelo_app;
GRANT UPDATE (nome, email) ON usuarios TO custelo_app;

CREATE OR REPLACE FUNCTION app.seed_convite_pendente_fixture()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO usuarios (id, email, nome, status)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000003', 'pending@example.test', 'Pendente', 'convite_pendente')
  ON CONFLICT (id) DO UPDATE SET status = 'convite_pendente';
END;
$$;

REVOKE ALL ON FUNCTION app.seed_convite_pendente_fixture() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.seed_convite_pendente_fixture() TO custelo_app;
