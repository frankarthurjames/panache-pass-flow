import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting ticket email sending");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { registrationId, pdfUrl } = await req.json();
    console.log("Registration ID:", registrationId, "PDF URL:", pdfUrl);

    // Récupérer les données de la registration
    const { data: registration, error: regError } = await supabaseClient
      .from('registrations')
      .select(`
        *,
        events (
          id,
          title,
          starts_at,
          ends_at,
          venue,
          city,
          organizations (
            name,
            logo_url
          )
        ),
        ticket_types (
          name,
          price_cents,
          currency
        ),
        users (
          display_name,
          email
        ),
        orders (
          total_cents
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      throw new Error("Registration not found");
    }

    console.log("Registration data loaded for email");

    // Préparer les données pour l'email
    const startDate = new Date(registration.events.starts_at);
    const ticketPrice = registration.ticket_types?.price_cents ? (registration.ticket_types.price_cents / 100) : 0;
    const totalAmount = registration.orders?.total_cents ? (registration.orders.total_cents / 100) : ticketPrice;

    // Envoyer l'email via Brevo
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    const emailData = {
      sender: {
        name: "Panache Esport",
        email: "noreply@panache-esport.com"
      },
      to: [
        {
          email: registration.users.email,
          name: registration.users.display_name || registration.users.email
        }
      ],
      subject: `Votre billet pour ${registration.events.title}`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Votre billet</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎫 Votre billet est prêt !</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Confirmation de votre inscription</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1e293b; margin-top: 0;">${registration.events.title}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #3b82f6;">📅 Détails de l'événement</h3>
              <p><strong>Date :</strong> ${startDate.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Heure :</strong> ${startDate.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
              ${registration.events.venue ? `<p><strong>Lieu :</strong> ${registration.events.venue}</p>` : ''}
              ${registration.events.city ? `<p><strong>Ville :</strong> ${registration.events.city}</p>` : ''}
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #10b981;">🎫 Votre billet</h3>
              <p><strong>Participant :</strong> ${registration.users.display_name || registration.users.email}</p>
              ${registration.ticket_types ? `<p><strong>Type :</strong> ${registration.ticket_types.name}</p>` : ''}
              <p><strong>Prix :</strong> ${ticketPrice}€</p>
              <p><strong>Numéro :</strong> ${registration.id}</p>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #d97706;">⚠️ Important</h3>
              <p>Présentez ce billet (imprimé ou sur votre téléphone) à l'entrée de l'événement. Vous pouvez également présenter le QR code qui sera scanné.</p>
              <p>Votre billet PDF est disponible en pièce jointe de cet email.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${pdfUrl}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">📄 Télécharger mon billet</a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center; color: #64748b;">
              <p>Merci d'avoir choisi Panache Esport !</p>
              <p style="font-size: 14px;">En cas de question, n'hésitez pas à nous contacter.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachment: [
        {
          name: `billet-${registration.events.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
          url: pdfUrl
        }
      ]
    };

    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey
      },
      body: JSON.stringify(emailData)
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Brevo API error:", errorData);
      throw new Error(`Failed to send email: ${errorData.message || 'Unknown error'}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({
      success: true,
      messageId: result.messageId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending ticket email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});