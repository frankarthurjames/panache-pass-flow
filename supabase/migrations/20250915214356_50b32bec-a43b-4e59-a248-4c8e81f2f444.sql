-- Drop existing problematic policies
DROP POLICY IF EXISTS "Organization members can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can delete event images" ON storage.objects;

-- Create simpler policies that don't cause recursion
CREATE POLICY "Authenticated users can upload event images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'event-images' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update event images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'event-images' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete event images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'event-images' AND 
  auth.uid() IS NOT NULL
);