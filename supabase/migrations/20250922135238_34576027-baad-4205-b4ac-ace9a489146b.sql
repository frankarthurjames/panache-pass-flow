-- Add images array field and remove cover_image_url
ALTER TABLE public.events 
ADD COLUMN images jsonb DEFAULT '[]'::jsonb;

-- Remove the old cover_image_url field
ALTER TABLE public.events 
DROP COLUMN cover_image_url;