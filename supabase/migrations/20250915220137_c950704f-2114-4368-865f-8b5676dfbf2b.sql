-- Créer des fixtures complètes pour l'application

-- Insérer des utilisateurs de test
INSERT INTO public.users (id, email, display_name, role, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'organisateur@example.com', 'Jean Dupont', 'admin', now() - interval '3 months', now()),
('550e8400-e29b-41d4-a716-446655440002', 'marie.martin@example.com', 'Marie Martin', 'participant', now() - interval '2 months', now()),
('550e8400-e29b-41d4-a716-446655440003', 'pierre.durand@example.com', 'Pierre Durand', 'participant', now() - interval '1 month', now()),
('550e8400-e29b-41d4-a716-446655440004', 'sophie.leclerc@example.com', 'Sophie Leclerc', 'participant', now() - interval '3 weeks', now());

-- Insérer des organisations
INSERT INTO public.organizations (id, name, slug, created_by_user_id, billing_email, billing_country, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440100', 'SportClub Lyon', 'sportclub-lyon', '550e8400-e29b-41d4-a716-446655440001', 'organisateur@example.com', 'FR', now() - interval '3 months', now()),
('550e8400-e29b-41d4-a716-446655440101', 'Tennis Academy', 'tennis-academy', '550e8400-e29b-41d4-a716-446655440001', 'organisateur@example.com', 'FR', now() - interval '2 months', now());

-- Insérer les memberships d'organisation
INSERT INTO public.organization_members (id, organization_id, user_id, role, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'owner', now() - interval '3 months', now()),
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'owner', now() - interval '2 months', now());

-- Insérer des événements
INSERT INTO public.events (id, title, description, starts_at, ends_at, venue, city, capacity, organization_id, status, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440300', 'Tournoi de Tennis Open 2025', 'Un tournoi de tennis passionnant avec des joueurs de tous niveaux', '2025-01-25 14:00:00+00', '2025-01-25 18:00:00+00', 'Courts de Tennis Municipal', 'Lyon', 60, '550e8400-e29b-41d4-a716-446655440100', 'published', now() - interval '2 months', now()),
('550e8400-e29b-41d4-a716-446655440301', 'Course à Pied Solidaire', 'Course solidaire au profit d''une association locale', '2025-02-15 09:00:00+00', '2025-02-15 12:00:00+00', 'Parc de la Tête d''Or', 'Lyon', 100, '550e8400-e29b-41d4-a716-446655440100', 'draft', now() - interval '1 month', now()),
('550e8400-e29b-41d4-a716-446655440302', 'Championnat Badminton Local', 'Championnat local de badminton amateur', '2025-03-08 10:00:00+00', '2025-03-08 17:00:00+00', 'Gymnase Pierre de Coubertin', 'Lyon', 40, '550e8400-e29b-41d4-a716-446655440100', 'published', now() - interval '3 weeks', now()),
('550e8400-e29b-41d4-a716-446655440303', 'Tournoi Futsal Inter-Entreprises', 'Tournoi de futsal réservé aux équipes d''entreprises', '2025-03-22 13:00:00+00', '2025-03-22 19:00:00+00', 'Complexe Sportif Gerland', 'Lyon', 32, '550e8400-e29b-41d4-a716-446655440100', 'published', now() - interval '2 weeks', now()),
('550e8400-e29b-41d4-a716-446655440304', 'Stage de Tennis Perfectionnement', 'Stage intensif pour améliorer votre technique', '2025-04-05 09:00:00+00', '2025-04-05 17:00:00+00', 'Tennis Academy Center', 'Lyon', 20, '550e8400-e29b-41d4-a716-446655440101', 'published', now() - interval '1 week', now());

-- Insérer des types de billets
INSERT INTO public.ticket_types (id, event_id, name, price_cents, quantity, max_per_order, created_at, updated_at) VALUES 
-- Tennis Open
('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440300', 'Participation Standard', 2500, 60, 1, now() - interval '2 months', now()),
-- Course Solidaire
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', 'Inscription Course', 1000, 100, 1, now() - interval '1 month', now()),
-- Badminton
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440302', 'Simple', 1500, 20, 1, now() - interval '3 weeks', now()),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440302', 'Double', 2000, 20, 1, now() - interval '3 weeks', now()),
-- Futsal
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440303', 'Équipe (8 joueurs)', 3000, 4, 1, now() - interval '2 weeks', now()),
-- Stage Tennis
('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440304', 'Stage Complet', 8500, 20, 1, now() - interval '1 week', now());

-- Insérer des commandes
INSERT INTO public.orders (id, user_id, event_id, total_cents, status, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440300', 2500, 'completed', now() - interval '1 month', now()),
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440300', 2500, 'completed', now() - interval '3 weeks', now()),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440302', 1500, 'completed', now() - interval '2 weeks', now()),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440303', 3000, 'completed', now() - interval '1 week', now());

-- Insérer des items de commande
INSERT INTO public.order_items (id, order_id, ticket_type_id, qty, unit_price_cents, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440400', 1, 2500, now() - interval '1 month', now()),
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440400', 1, 2500, now() - interval '3 weeks', now()),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440402', 1, 1500, now() - interval '2 weeks', now()),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440404', 1, 3000, now() - interval '1 week', now());

-- Insérer des inscriptions
INSERT INTO public.registrations (id, user_id, event_id, order_id, ticket_type_id, status, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440700', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440400', 'issued', now() - interval '1 month', now()),
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440400', 'issued', now() - interval '3 weeks', now()),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440402', 'issued', now() - interval '2 weeks', now()),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440404', 'issued', now() - interval '1 week', now());

-- Insérer des paiements
INSERT INTO public.payments (id, order_id, amount_cents, currency, provider, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440800', '550e8400-e29b-41d4-a716-446655440500', 2500, 'EUR', 'stripe', now() - interval '1 month'),
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440501', 2500, 'EUR', 'stripe', now() - interval '3 weeks'),
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440502', 1500, 'EUR', 'stripe', now() - interval '2 weeks'),
('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440503', 3000, 'EUR', 'stripe', now() - interval '1 week');