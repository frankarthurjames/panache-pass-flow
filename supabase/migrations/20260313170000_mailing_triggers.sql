-- Mailing system triggers and functions

-- 1. Helper function to call the email edge function
CREATE OR REPLACE FUNCTION public.trigger_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  template_key TEXT;
  to_email TEXT;
  user_name TEXT;
  org_name TEXT;
  event_name TEXT;
BEGIN
  -- Logic based on which table triggered the function
  IF (TG_TABLE_NAME = 'users' AND TG_OP = 'INSERT') THEN
    template_key := 'welcome';
    to_email := NEW.email;
    user_name := COALESCE(NEW.display_name, split_part(NEW.email, '@', 1));
    payload := jsonb_build_object(
      'to', to_email,
      'templateKey', template_key,
      'params', jsonb_build_object(
        'userName', user_name,
        'loginUrl', 'https://panache-esport.com/auth'
      )
    );
  ELSIF (TG_TABLE_NAME = 'organizations' AND TG_OP = 'INSERT') THEN
    -- Get creator's email
    SELECT email, display_name INTO to_email, user_name FROM public.users WHERE id = NEW.created_by_user_id;
    template_key := 'org-created';
    payload := jsonb_build_object(
      'to', to_email,
      'templateKey', template_key,
      'params', jsonb_build_object(
        'userName', COALESCE(user_name, split_part(to_email, '@', 1)),
        'organizationName', NEW.name,
        'dashboardUrl', 'https://panache-esport.com/dashboard/org/' || NEW.id
      )
    );
  ELSIF (TG_TABLE_NAME = 'events' AND TG_OP = 'INSERT') THEN
    -- Get organization creator's email (as a proxy for the organizer)
    SELECT u.email, u.display_name INTO to_email, user_name 
    FROM public.users u 
    JOIN public.organizations o ON o.created_by_user_id = u.id 
    WHERE o.id = NEW.organization_id;
    
    template_key := 'event-created';
    payload := jsonb_build_object(
      'to', to_email,
      'templateKey', template_key,
      'params', jsonb_build_object(
        'userName', COALESCE(user_name, split_part(to_email, '@', 1)),
        'eventName', NEW.title,
        'eventDate', NEW.starts_at::text,
        'eventLocation', COALESCE(NEW.venue, NEW.city, 'En ligne'),
        'manageUrl', 'https://panache-esport.com/dashboard/org/' || NEW.organization_id || '/events/' || NEW.id
      )
    );
  END IF;

  -- Add to notifications queue
  INSERT INTO public.notifications (
    type, 
    template_key, 
    to_email, 
    payload, 
    status
  ) VALUES (
    'email', 
    template_key, 
    to_email, 
    payload, 
    'queued'
  );

  -- Perform the actual HTTP call to the Supabase Edge Function
  -- Note: This requires the http extension to be enabled in Supabase
  PERFORM net.http_post(
    url := (SELECT value FROM (SELECT current_setting('request.headers', true)::json->>'x-forwarded-proto' as proto, current_setting('request.headers', true)::json->>'host' as host) s) || '/functions/v1/send-brevo-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT value FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create triggers
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.trigger_email_notification();

CREATE TRIGGER on_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_email_notification();

CREATE TRIGGER on_event_created
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.trigger_email_notification();

-- 3. Capacity alert logic
CREATE OR REPLACE FUNCTION public.check_event_capacity_alerts()
RETURNS TRIGGER AS $$
DECLARE
  v_capacity INTEGER;
  v_sold INTEGER;
  v_percentage INTEGER;
  v_to_email TEXT;
  v_user_name TEXT;
  v_event_title TEXT;
BEGIN
  -- Get event details
  SELECT capacity, title, organization_id INTO v_capacity, v_event_title FROM public.events WHERE id = NEW.event_id;
  
  -- Count total registrations for this event
  SELECT count(*) INTO v_sold FROM public.registrations WHERE event_id = NEW.event_id AND status = 'issued';
  
  IF v_capacity > 0 THEN
    v_percentage := (v_sold * 100) / v_capacity;
    
    -- Check if we hit a threshold (25, 50, 75, 100)
    -- This logic could be improved to prevent duplicate alerts if multiple tickets are bought at once
    IF v_percentage IN (25, 50, 75, 100) THEN
      -- Get organizer email
      SELECT u.email, u.display_name INTO v_to_email, v_user_name 
      FROM public.users u 
      JOIN public.organizations o ON o.created_by_user_id = u.id 
      WHERE o.id = (SELECT organization_id FROM public.events WHERE id = NEW.event_id);

      INSERT INTO public.notifications (type, template_key, to_email, payload, status)
      VALUES (
        'email', 
        'capacity-alert', 
        v_to_email, 
        jsonb_build_object(
          'to', v_to_email,
          'templateKey', 'capacity-alert',
          'params', jsonb_build_object(
            'eventName', v_event_title,
            'percentage', v_percentage,
            'ticketsSold', v_sold,
            'totalCapacity', v_capacity,
            'dashboardUrl', 'https://panache-esport.com/dashboard'
          )
        ),
        'queued'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_registration_created_capacity
  AFTER INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.check_event_capacity_alerts();
