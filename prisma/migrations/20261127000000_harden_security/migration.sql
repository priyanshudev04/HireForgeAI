-- Fixes from Supabase's security advisor:
-- 1. Pin the function's search_path so it can't be hijacked by objects in
--    other schemas (lint 0011_function_search_path_mutable). It only calls
--    pg_catalog built-ins, so an empty search_path is safe.
ALTER FUNCTION public.uuid_generate_v7() SET search_path = '';
-- 2. Prisma's own bookkeeping table also lives in `public`, so hide it from
--    Supabase's REST API like every other table.
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
