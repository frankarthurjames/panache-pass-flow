-- Créer la table work_reports pour gérer les rapports de travail
CREATE TABLE IF NOT EXISTS work_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_validation', 'validated', 'rejected')),
  data JSONB NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_work_reports_event_id ON work_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_work_reports_status ON work_reports(status);
CREATE INDEX IF NOT EXISTS idx_work_reports_generated_at ON work_reports(generated_at);

-- RLS (Row Level Security)
ALTER TABLE work_reports ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres rapports
CREATE POLICY "Users can view their own work reports" ON work_reports
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events 
      WHERE organization_id IN (
        SELECT id FROM organizations 
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Politique pour permettre aux utilisateurs de créer des rapports pour leurs événements
CREATE POLICY "Users can create work reports for their events" ON work_reports
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT id FROM events 
      WHERE organization_id IN (
        SELECT id FROM organizations 
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Politique pour permettre aux utilisateurs de mettre à jour leurs rapports
CREATE POLICY "Users can update their own work reports" ON work_reports
  FOR UPDATE USING (
    event_id IN (
      SELECT id FROM events 
      WHERE organization_id IN (
        SELECT id FROM organizations 
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_work_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_work_reports_updated_at
  BEFORE UPDATE ON work_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_work_reports_updated_at();
