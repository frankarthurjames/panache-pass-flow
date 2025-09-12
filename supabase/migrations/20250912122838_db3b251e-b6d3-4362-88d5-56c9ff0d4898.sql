-- Create enum types
CREATE TYPE public.user_role AS ENUM ('participant', 'organizer', 'admin');
CREATE TYPE public.org_member_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'canceled', 'refunded');
CREATE TYPE public.registration_status AS ENUM ('issued', 'checked_in', 'void');
CREATE TYPE public.notification_type AS ENUM ('email');
CREATE TYPE public.notification_status AS ENUM ('queued', 'sent', 'failed');

-- Create users profile table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role public.user_role DEFAULT 'participant',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  billing_email TEXT,
  billing_country TEXT DEFAULT 'FR',
  stripe_account_id TEXT,
  created_by_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create organization_members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role public.org_member_role DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  venue TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  capacity INTEGER CHECK (capacity >= 0),
  cover_image_url TEXT,
  status public.event_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ticket_types table
CREATE TABLE public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT DEFAULT 'EUR',
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  max_per_order INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  event_id UUID REFERENCES public.events(id),
  status public.order_status DEFAULT 'pending',
  total_cents INTEGER NOT NULL DEFAULT 0,
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES public.ticket_types(id),
  unit_price_cents INTEGER NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id),
  ticket_type_id UUID REFERENCES public.ticket_types(id),
  order_id UUID REFERENCES public.orders(id),
  user_id UUID REFERENCES public.users(id),
  status public.registration_status DEFAULT 'issued',
  qr_code TEXT UNIQUE,
  pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  provider TEXT DEFAULT 'stripe',
  provider_event TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.notification_type,
  template_key TEXT,
  to_email TEXT,
  subject TEXT,
  payload JSONB,
  status public.notification_status DEFAULT 'queued',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE,
  brevo_template_id INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create webhook_events table
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT DEFAULT 'stripe',
  event_id TEXT UNIQUE,
  type TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  raw_payload JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_events_organization_status_starts ON public.events(organization_id, status, starts_at);
CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_ticket_types_event_id ON public.ticket_types(event_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_event_id ON public.orders(event_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_registrations_event_user_status ON public.registrations(event_id, user_id, status);
CREATE INDEX idx_registrations_order_id ON public.registrations(order_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for organizations table
CREATE POLICY "Organizations are viewable by members" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = id AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Organization owners can update" ON public.organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = id AND user_id::text = auth.uid()::text AND role = 'owner'
    )
  );

CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (created_by_user_id::text = auth.uid()::text);

-- Create RLS policies for events table
CREATE POLICY "Published events are viewable by everyone" ON public.events
  FOR SELECT USING (status = 'published');

CREATE POLICY "Organization members can view all events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = events.organization_id AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Organization members can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = events.organization_id AND user_id::text = auth.uid()::text
    )
  );

-- Create RLS policies for ticket_types table
CREATE POLICY "Ticket types are viewable with their events" ON public.ticket_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND (
        status = 'published' OR 
        EXISTS (
          SELECT 1 FROM public.organization_members 
          WHERE organization_id = events.organization_id AND user_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Organization members can manage ticket types" ON public.ticket_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE e.id = event_id AND om.user_id::text = auth.uid()::text
    )
  );

-- Create RLS policies for orders table
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Create RLS policies for registrations table
CREATE POLICY "Users can view their own registrations" ON public.registrations
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Organization members can view event registrations" ON public.registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE e.id = event_id AND om.user_id::text = auth.uid()::text
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON public.ticket_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();