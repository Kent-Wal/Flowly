-- Supabase exposes the public schema via PostgREST. _prisma_migrations is internal
-- Prisma metadata and must not be reachable by anon/authenticated API roles.
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."_prisma_migrations" FROM anon, authenticated;
