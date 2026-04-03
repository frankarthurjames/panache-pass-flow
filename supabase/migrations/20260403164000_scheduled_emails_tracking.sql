-- Migration to add tracking columns for scheduled emails
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS thanks_sent_at TIMESTAMPTZ;
