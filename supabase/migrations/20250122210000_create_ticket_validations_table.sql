-- Create ticket_validations table for QR code validation tracking
CREATE TABLE IF NOT EXISTS public.ticket_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_by TEXT, -- ID of the user who validated the ticket
  status TEXT NOT NULL CHECK (status IN ('valid', 'invalid', 'upcoming', 'expired', 'active')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE public.ticket_validations ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert validations (for QR scanning)
CREATE POLICY "Allow ticket validation inserts"
ON public.ticket_validations
FOR INSERT
WITH CHECK (true);

-- Policy to allow organization members to view validations for their events
CREATE POLICY "Organization members can view validations"
ON public.ticket_validations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.registrations r
    JOIN public.events e ON r.event_id = e.id
    JOIN public.organization_members om ON e.organization_id = om.organization_id
    WHERE r.id = ticket_validations.registration_id
      AND om.user_id = auth.uid()
  )
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_validations_registration_id ON public.ticket_validations(registration_id);
CREATE INDEX IF NOT EXISTS idx_ticket_validations_validated_at ON public.ticket_validations(validated_at);

