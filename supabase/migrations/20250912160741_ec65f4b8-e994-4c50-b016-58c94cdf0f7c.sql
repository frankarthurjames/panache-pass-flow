-- Add SIRET number field to organizations table
ALTER TABLE public.organizations 
ADD COLUMN siret_number TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.organizations.siret_number IS 'Numéro SIRET de l''organisation française';