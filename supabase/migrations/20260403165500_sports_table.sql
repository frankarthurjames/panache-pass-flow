-- Create sports table
CREATE TABLE IF NOT EXISTS public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add sport_id to events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES public.sports(id);

-- Enable RLS on sports
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

-- Allow public read access to sports
CREATE POLICY "Allow public read access to sports"
  ON public.sports FOR SELECT
  USING (true);

-- Insert default sports
INSERT INTO public.sports (name, slug) VALUES
  ('Athlétisme', 'athletisme'),
  ('Tennis', 'tennis'),
  ('Kayak', 'kayak'),
  ('Natation', 'natation'),
  ('VTT', 'vtt'),
  ('Football', 'football'),
  ('Basketball', 'basketball'),
  ('Cyclisme', 'cyclisme'),
  ('Randonnée', 'randonnee'),
  ('Arts Martiaux', 'arts-martiaux'),
  ('Fitness', 'fitness'),
  ('Volleyball', 'volleyball'),
  ('Badminton', 'badminton'),
  ('BMX', 'bmx')
ON CONFLICT (name) DO NOTHING;
