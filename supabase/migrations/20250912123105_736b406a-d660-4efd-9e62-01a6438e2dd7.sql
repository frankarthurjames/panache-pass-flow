-- Fix security warnings by adding missing RLS policies and securing functions

-- Create policies for organization_members table
CREATE POLICY "Organization members can view their memberships" ON public.organization_members
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Organization owners can manage members" ON public.organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id 
      AND om.user_id::text = auth.uid()::text 
      AND om.role = 'owner'
    )
  );

CREATE POLICY "Users can join organizations they're invited to" ON public.organization_members
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Create policies for order_items table
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create their order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id::text = auth.uid()::text
    )
  );

-- Create policies for payments table (read-only for users, system manages)
CREATE POLICY "Users can view their payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id::text = auth.uid()::text
    )
  );

-- Create policies for notifications table
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (to_email = (SELECT email FROM public.users WHERE id::text = auth.uid()::text));

-- Create policies for email_templates table (admin only)
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can view email templates" ON public.email_templates
  FOR SELECT USING (true);

-- Create policies for webhook_events table (system only - no user access needed)
CREATE POLICY "System only webhook events" ON public.webhook_events
  FOR SELECT USING (false);

-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;