-- Uploader le logo Panache dans le storage
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'event-images',
  'panache-logo-text.png',
  null,
  '{"size": 0, "mimetype": "image/png"}'::jsonb
)
ON CONFLICT (bucket_id, name) DO NOTHING;