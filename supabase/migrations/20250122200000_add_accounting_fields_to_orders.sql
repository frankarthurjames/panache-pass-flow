-- Add accounting fields to orders table for proper invoicing
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS total_ht_cents BIGINT,
ADD COLUMN IF NOT EXISTS tva_cents BIGINT;

-- Add comments for clarity
COMMENT ON COLUMN public.orders.subtotal_cents IS 'Montant des billets HT en centimes';
COMMENT ON COLUMN public.orders.platform_fee_cents IS 'Frais de plateforme HT en centimes';
COMMENT ON COLUMN public.orders.total_ht_cents IS 'Total HT (billets + frais plateforme) en centimes';
COMMENT ON COLUMN public.orders.tva_cents IS 'TVA (20%) en centimes';
COMMENT ON COLUMN public.orders.total_cents IS 'Total TTC en centimes';
