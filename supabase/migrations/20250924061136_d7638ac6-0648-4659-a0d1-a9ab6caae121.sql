-- Insert email template for invoice sending
INSERT INTO email_templates (key, description, brevo_template_id) 
VALUES ('invoice', 'Template for sending Stripe invoice after payment', 4)
ON CONFLICT (key) DO UPDATE SET 
description = EXCLUDED.description,
brevo_template_id = EXCLUDED.brevo_template_id;