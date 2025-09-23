-- Créer le bucket pour stocker les reçus PDF
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf']
);

-- Politique pour permettre la lecture publique des reçus
CREATE POLICY "Receipts are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'receipts');

-- Politique pour permettre l'upload des reçus (service role seulement)
CREATE POLICY "Service role can upload receipts"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'receipts');

-- Politique pour permettre la suppression des reçus (service role seulement)
CREATE POLICY "Service role can delete receipts"
ON storage.objects
FOR DELETE
USING (bucket_id = 'receipts');
