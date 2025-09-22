-- Enable RLS (idempotent)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Clean up and recreate consistent policies
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Creators can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organizations are viewable by members" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners can update" ON public.organizations;

-- Allow logged-in users to create organizations they own
CREATE POLICY "Users can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (created_by_user_id = auth.uid());

-- Creators can view their own organizations (needed for returning rows)
CREATE POLICY "Creators can view their organizations"
ON public.organizations
FOR SELECT
USING (created_by_user_id = auth.uid());

-- Members can view organizations they belong to
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

-- Owners can update their organizations
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
