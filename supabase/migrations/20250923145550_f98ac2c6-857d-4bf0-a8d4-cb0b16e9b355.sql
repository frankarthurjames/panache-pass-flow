-- Créer la table ticket_validations si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.ticket_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_by TEXT NOT NULL DEFAULT 'system',
  status TEXT NOT NULL DEFAULT 'validated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter RLS
ALTER TABLE public.ticket_validations ENABLE ROW LEVEL SECURITY;

-- Politique pour que les membres d'organisation puissent voir les validations de leurs événements
CREATE POLICY "Organization members can view ticket validations" 
ON public.ticket_validations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM registrations r
    JOIN events e ON e.id = r.event_id
    JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE r.id = ticket_validations.registration_id 
    AND om.user_id = auth.uid()
  )
);

-- Politique pour que les membres d'organisation puissent créer des validations
CREATE POLICY "Organization members can create ticket validations" 
ON public.ticket_validations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM registrations r
    JOIN events e ON e.id = r.event_id
    JOIN organization_members om ON om.organization_id = e.organization_id
    WHERE r.id = ticket_validations.registration_id 
    AND om.user_id = auth.uid()
  )
);