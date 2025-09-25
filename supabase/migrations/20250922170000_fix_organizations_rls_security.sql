-- Fix critical RLS security issue for organizations table
-- Ensure only members can see organizations

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Creators can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organizations are viewable by members" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners can update" ON public.organizations;

-- Ensure RLS is enabled
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 1. INSERT policy: Users can create organizations they own
CREATE POLICY "Users can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (created_by_user_id = auth.uid());

-- 2. SELECT policy: Only members can view organizations
CREATE POLICY "Only members can view organizations"
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

-- 3. UPDATE policy: Only owners can update organizations
CREATE POLICY "Only owners can update organizations"
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

-- 4. DELETE policy: Only owners can delete organizations
CREATE POLICY "Only owners can delete organizations"
ON public.organizations
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'::org_member_role
  )
);

-- Also ensure organization_members table has proper RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for organization_members
DROP POLICY IF EXISTS "Users can view their memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners can manage members" ON public.organization_members;

-- 1. Users can view their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.organization_members
FOR SELECT
USING (user_id = auth.uid());

-- 2. Users can view members of organizations they belong to
CREATE POLICY "Members can view organization members"
ON public.organization_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om2
    WHERE om2.organization_id = organization_members.organization_id
      AND om2.user_id = auth.uid()
  )
);

-- 3. Only owners can add/remove members
CREATE POLICY "Only owners can manage members"
ON public.organization_members
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'::org_member_role
  )
);

-- 4. Users can be added as members (for the initial creation)
CREATE POLICY "Users can be added as members"
ON public.organization_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'::org_member_role
  )
);

