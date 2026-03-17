import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { renderToString } from "npm:react-dom@18.3.1/server";
import * as React from "npm:react@18.3.1";

// Import templates
import WelcomeEmail from "../email-templates/brevo-welcome.tsx";
import PasswordResetEmail from "../email-templates/brevo-password-reset.tsx";
import OrgCreatedEmail from "../email-templates/brevo-org-created.tsx";
import EventCreatedEmail from "../email-templates/brevo-event-created.tsx";
import CapacityAlertEmail from "../email-templates/brevo-capacity-alert.tsx";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { to, templateKey, params, attachments } = await req.json();
        console.log(`Sending email to ${to} using template ${templateKey}`);

        const brevoApiKey = Deno.env.get("BREVO_API_KEY");
        if (!brevoApiKey) throw new Error("BREVO_API_KEY not configured");

        let htmlContent = "";
        let subject = "";

        // Template mapping
        switch (templateKey) {
            case "welcome":
                htmlContent = renderToString(React.createElement(WelcomeEmail, params));
                subject = `Bienvenue sur Panache, ${params.userName} !`;
                break;
            case "password-reset":
                htmlContent = renderToString(React.createElement(PasswordResetEmail, params));
                subject = "Réinitialisation de votre mot de passe Panache";
                break;
            case "org-created":
                htmlContent = renderToString(React.createElement(OrgCreatedEmail, params));
                subject = `Votre organisation ${params.organizationName} est prête !`;
                break;
            case "event-created":
                htmlContent = renderToString(React.createElement(EventCreatedEmail, params));
                subject = `Votre événement ${params.eventName} est en ligne !`;
                break;
            case "capacity-alert":
                const emoji = params.percentage >= 100 ? "🔥" : "📈";
                htmlContent = renderToString(React.createElement(CapacityAlertEmail, params));
                subject = `${emoji} ${params.eventName} est à ${params.percentage}% !`;
                break;
            case "invoice":
                // Logic for invoice email which might use a generic template or the confirmation one
                // For now, if we have a specific invoice flow, we can add it here.
                // If not, we use the confirmation logic.
                subject = `Votre reçu pour ${params.event_title}`;
                // Fallback or specific template for invoice
                break;
            default:
                throw new Error(`Template ${templateKey} not found`);
        }

        const emailData: any = {
            sender: { name: "Panache Esport", email: "noreply@panache-esport.com" },
            to: [{ email: to }],
            subject: subject,
            htmlContent: htmlContent,
        };

        if (attachments && attachments.length > 0) {
            emailData.attachment = attachments;
        }

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "api-key": brevoApiKey,
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Brevo API error: ${error.message}`);
        }

        const result = await response.json();
        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Error in send-brevo-email:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
