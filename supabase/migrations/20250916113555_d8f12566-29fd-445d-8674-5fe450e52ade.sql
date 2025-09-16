begin;

-- Remove orphan memberships that don't have a corresponding organization
DELETE FROM public.organization_members om
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations o WHERE o.id = om.organization_id
);

-- Add foreign key from organization_members.organization_id to organizations.id
DO $$ BEGIN
  ALTER TABLE public.organization_members
  ADD CONSTRAINT organization_members_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES public.organizations(id)
  ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON public.organization_members(organization_id);

commit;