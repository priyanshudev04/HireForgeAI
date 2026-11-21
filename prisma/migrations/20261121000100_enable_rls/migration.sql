-- Supabase exposes every table in `public` through its auto-generated REST
-- API to anyone holding the project's anon key. The app only talks to the
-- database through Prisma on the server (as the table owner, which bypasses
-- RLS), so turn RLS on with no policies: the REST API sees nothing, Prisma
-- is unaffected. Add policies later only if the browser ever needs direct access.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END
$$;
