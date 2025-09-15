-- Fix recursive RLS on organization_members and add current user to fixtures

-- 1) Helper function to check ownership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'owner'::org_member_role
  );
$$;

-- 2) Replace problematic ALL policy that caused recursion
DROP POLICY IF EXISTS "Organization owners can manage members" ON public.organization_members;

-- 3) Recreate granular policies without SELECT to avoid recursion
CREATE POLICY "Owners can insert members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_owner(organization_id));

CREATE POLICY "Owners can update members"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (public.is_org_owner(organization_id));

CREATE POLICY "Owners can delete members"
ON public.organization_members
FOR DELETE
TO authenticated
USING (public.is_org_owner(organization_id));

-- Keep existing SELECT policy for users to see their own membership
-- Optionally, allow owners to view all members of their org
CREATE POLICY IF NOT EXISTS "Owners can view org members"
ON public.organization_members
FOR SELECT
TO authenticated
USING (public.is_org_owner(organization_id));

-- 4) Add the current logged-in user as member of the sample organizations
-- User from logs: 0caf6c33-33a3-4c60-b1bf-a9fe8511334d
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440100', '0caf6c33-33a3-4c60-b1bf-a9fe8511334d', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440101', '0caf6c33-33a3-4c60-b1bf-a9fe8511334d', 'owner')
ON CONFLICT DO NOTHING;