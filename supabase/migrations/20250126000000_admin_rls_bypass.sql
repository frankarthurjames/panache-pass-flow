-- Grant full access to users with the 'admin' role, bypassing organization-based restrictions

-- 1. Organizations
CREATE POLICY "Admins have full access to organizations"
ON public.organizations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 7. Users (Allow admins to see and manage users)
CREATE POLICY "Admins have full access to users"
ON public.users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_check
    WHERE admin_check.id = auth.uid() AND admin_check.role = 'admin'
  )
);

-- 2. Organization Members
CREATE POLICY "Admins have full access to organization members"
ON public.organization_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 3. Events
CREATE POLICY "Admins have full access to events"
ON public.events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 4. Ticket Types
CREATE POLICY "Admins have full access to ticket types"
ON public.ticket_types
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 5. Orders
CREATE POLICY "Admins have full access to orders"
ON public.orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 6. Registrations
CREATE POLICY "Admins have full access to registrations"
ON public.registrations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
