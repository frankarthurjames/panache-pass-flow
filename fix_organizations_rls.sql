-- Script pour corriger les politiques RLS de la table organizations
-- À exécuter dans l'interface Supabase SQL Editor

-- 1. S'assurer que RLS est activé
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Creators can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners can update" ON public.organizations;
DROP POLICY IF EXISTS "Organizations are viewable by members" ON public.organizations;

-- 3. Créer la politique INSERT pour permettre la création d'organisations
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT 
  WITH CHECK (created_by_user_id::text = auth.uid()::text);

-- 4. Créer la politique SELECT pour que les créateurs puissent voir leurs organisations
CREATE POLICY "Creators can view their organizations" ON public.organizations
  FOR SELECT
  USING (created_by_user_id = auth.uid());

-- 5. Créer la politique SELECT pour que les membres puissent voir les organisations
CREATE POLICY "Organizations are viewable by members" ON public.organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
    )
  );

-- 6. Créer la politique UPDATE pour que les propriétaires puissent modifier
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

-- 7. Vérifier que les politiques sont bien créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'organizations';
