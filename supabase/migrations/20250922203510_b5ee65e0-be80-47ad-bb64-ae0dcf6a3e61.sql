-- Create event_likes table for like functionality
CREATE TABLE public.event_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for event_likes
CREATE POLICY "Users can like events" 
ON public.event_likes 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view likes" 
ON public.event_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can unlike events" 
ON public.event_likes 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Add ticket_qr_url to registrations table for PDF generation
ALTER TABLE public.registrations 
ADD COLUMN ticket_qr_url TEXT,
ADD COLUMN ticket_pdf_url TEXT;