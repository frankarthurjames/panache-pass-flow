-- Fix broken RLS policies on organizations to allow creation + reading the newly inserted row

-- 1) SELECT policy for members (correct join)
DROP POLICY IF EXISTS "Organizations are viewable by members" ON public.organizations;
CREATE POLICY "Organizations are viewable by members"
ON public.organizations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
  )
);

-- 2) SELECT policy for creators to read their own organizations (enables INSERT ... SELECT returning)
CREATE POLICY IF NOT EXISTS "Creators can view their organizations"
ON public.organizations
FOR SELECT
USING (created_by_user_id = auth.uid());

-- 3) UPDATE policy for owners (correct join)
DROP POLICY IF EXISTS "Organization owners can update" ON public.organizations;
CREATE POLICY "Organization owners can update"
ON public.organizations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'::org_member_role
  )
);
