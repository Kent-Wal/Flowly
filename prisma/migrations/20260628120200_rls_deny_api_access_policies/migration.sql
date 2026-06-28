-- Supabase linter requires policies when RLS is enabled. Flowly never exposes these
-- tables via PostgREST; the Render API uses Prisma as the postgres role (bypasses RLS).

DROP POLICY IF EXISTS "deny_api_access" ON public."User";
CREATE POLICY "deny_api_access"
ON public."User"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "deny_api_access" ON public."Item";
CREATE POLICY "deny_api_access"
ON public."Item"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "deny_api_access" ON public."Account";
CREATE POLICY "deny_api_access"
ON public."Account"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "deny_api_access" ON public."Transaction";
CREATE POLICY "deny_api_access"
ON public."Transaction"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "deny_api_access" ON public."CategoryMap";
CREATE POLICY "deny_api_access"
ON public."CategoryMap"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "deny_api_access" ON public."RemovedPlaidAccount";
CREATE POLICY "deny_api_access"
ON public."RemovedPlaidAccount"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "deny_api_access" ON public."_prisma_migrations";
CREATE POLICY "deny_api_access"
ON public."_prisma_migrations"
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
