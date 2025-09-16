-- Create test organizations
INSERT INTO public.organizations (id, name, created_by_user_id, logo_url, billing_email, billing_country) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'SportClub Lyon', '0caf6c33-33a3-4c60-b1bf-a9fe8511334d', null, 'contact@sportclub-lyon.fr', 'FR'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Tennis Academy', '0caf6c33-33a3-4c60-b1bf-a9fe8511334d', null, 'contact@tennis-academy.fr', 'FR');

-- Add user as owner to both organizations
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '0caf6c33-33a3-4c60-b1bf-a9fe8511334d', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440002', '0caf6c33-33a3-4c60-b1bf-a9fe8511334d', 'owner');