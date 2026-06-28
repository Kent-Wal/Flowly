-- Flowly uses Prisma on the server (postgres role), not Supabase Auth or PostgREST.
-- Enable RLS and revoke Data API roles so public tables are not reachable from the internet.

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Item" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CategoryMap" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RemovedPlaidAccount" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."User" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Item" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Account" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Transaction" FROM anon, authenticated;
REVOKE ALL ON TABLE public."CategoryMap" FROM anon, authenticated;
REVOKE ALL ON TABLE public."RemovedPlaidAccount" FROM anon, authenticated;
