-- Fix missing INSERT policy for organizations table
-- This allows users to create organizations

-- Ensure the table has RLS enabled
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

-- Add the missing INSERT policy for organizations
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT 
  WITH CHECK (created_by_user_id::text = auth.uid()::text);

-- Ensure we have the SELECT policy for creators to read their own organizations
DROP POLICY IF EXISTS "Creators can view their organizations" ON public.organizations;
CREATE POLICY "Creators can view their organizations" ON public.organizations
  FOR SELECT
  USING (created_by_user_id = auth.uid());

-- Ensure we have the UPDATE policy for owners
DROP POLICY IF EXISTS "Organization owners can update" ON public.organizations;
CREATE POLICY "Organization owners can update" ON public.organizations
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
