-- Ajouter les champs pour les frais de plateforme dans la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER DEFAULT 0;

-- Mettre à jour les commandes existantes pour calculer les frais
UPDATE public.orders 
SET 
  subtotal_cents = total_cents - COALESCE(platform_fee_cents, 0),
  platform_fee_cents = CASE 
    WHEN total_cents > 0 THEN 
      -- Calculer les frais de plateforme (2% + 0,50€ par billet)
      -- Pour les commandes existantes, on estime 1 billet par commande
      ROUND(total_cents * 0.02) + 50
    ELSE 0
  END
WHERE subtotal_cents IS NULL OR platform_fee_cents IS NULL;

-- Ajouter des commentaires pour clarifier les champs
COMMENT ON COLUMN public.orders.subtotal_cents IS 'Montant des billets avant frais de plateforme (en centimes)';
COMMENT ON COLUMN public.orders.platform_fee_cents IS 'Frais de plateforme (2% + 0,50€ par billet) en centimes';
COMMENT ON COLUMN public.orders.total_cents IS 'Montant total payé par le client (subtotal + frais de plateforme) en centimes';
