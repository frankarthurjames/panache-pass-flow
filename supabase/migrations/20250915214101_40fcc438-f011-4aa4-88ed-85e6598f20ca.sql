-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);

-- Create policies for event images
CREATE POLICY "Event images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-images');

CREATE POLICY "Organization members can upload event images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'event-images' AND 
  EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Organization members can update event images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'event-images' AND 
  EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Organization members can delete event images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'event-images' AND 
  EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id::text = auth.uid()::text
  )
);