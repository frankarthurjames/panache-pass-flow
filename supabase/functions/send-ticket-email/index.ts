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

    // Récupération registration + relations
    const { data: registration, error: regError } = await supabaseClient
      .from("registrations")
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
      .eq("id", registrationId)
      .single();

    if (regError || !registration) {
      throw new Error("Registration not found");
    }

    console.log("Registration data loaded for email");

    // Données email
    const startDate = new Date(registration.events.starts_at);
    const ticketPrice = registration.ticket_types?.price_cents
      ? registration.ticket_types.price_cents / 100
      : 0;
    const totalAmount = registration.orders?.total_cents
      ? registration.orders.total_cents / 100
      : ticketPrice;

    const orgName = registration.events.organizations?.name ?? "Panache Esport";
    const orgLogo = registration.events.organizations?.logo_url ?? "";

    // Envoi via Brevo
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    // Couleurs (orange)
    const brand = {
      bg: "#FFFFFF",            // fond global blanc
      card: "#FFFFFF",          // cartes / blocs
      text: "#0F172A",          // slate-900
      subtext: "#475569",       // slate-600
      divider: "#E2E8F0",       // slate-200
      accent: "#F97316",        // orange-500
      accentDark: "#EA580C",    // orange-600 (hover)
      softBg: "#FFF7ED"         // orange-50 (fond doux de section)
    };

    const preheader = `Votre billet pour ${registration.events.title} est prêt.`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Votre billet – ${registration.events.title}</title>
  <!-- Preheader (masqué) -->
  <style>
    .preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; }
    @media (prefers-color-scheme: dark) {
      .dark-bg { background:${brand.bg} !important; }
      .card { background:${brand.card} !important; color:${brand.text} !important; }
      .text { color:${brand.text} !important; }
      .subtext { color:${brand.subtext} !important; }
      .divider { border-color:${brand.divider} !important; }
      .btn { color:#111827 !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:${brand.bg};">
  <span class="preheader">${preheader}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="dark-bg" style="background:${brand.bg};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;">
          <!-- Header -->
          <tr>
            <td style="padding:16px 20px; background:${brand.bg};">
              <table role="presentation" width="100%">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    ${orgLogo ? 
                      `<img src="${orgLogo}" alt="${orgName}" height="36" style="display:block; border:0; outline:none; text-decoration:none; height:36px; margin-right:12px;">` : 
                      `<img src="https://wlxbydzshqijlfejqafp.supabase.co/storage/v1/object/public/panache-logo-text.png" alt="Panache Esport" height="36" style="display:block; border:0; outline:none; text-decoration:none; height:36px;">`
                    }
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-family:Arial,Helvetica,sans-serif; font-size:12px; color:${brand.subtext};">Confirmation de billet</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:0 20px;">
              <table role="presentation" width="100%" style="border-radius:16px; overflow:hidden;">
                <tr>
                  <td bgcolor="${brand.accent}" style="background:${brand.accent}; padding:32px 28px; text-align:center;">
                
                    <div style="font-family:Arial,Helvetica,sans-serif; color:#FFFFFF; font-size:26px; line-height:1.25; font-weight:800; letter-spacing:0.2px;">
                      Votre billet est prêt
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif; color:#FFE4D5; font-size:14px; margin-top:8px;">
                      ${orgName} × Panache Esport
                    </div>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#FFFFFF" class="card" style="background:${brand.card}; padding:28px;">
                    <div style="font-family:Arial,Helvetica,sans-serif; color:${brand.text}; font-size:20px; font-weight:700; margin:0 0 8px 0;">
                      ${registration.events.title}
                    </div>
                    <div style="font-family:Arial,Helvetica,sans-serif; color:${brand.subtext}; font-size:14px; margin:0 0 16px 0;">
                      Votre inscription a bien été enregistrée.
                    </div>

                    <!-- Event details -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate; border-spacing:0; background:${brand.softBg}; border-radius:12px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <table role="presentation" width="100%">
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${brand.text};">
                                <strong style="display:inline-block; min-width:84px;">Date</strong>
                                ${startDate.toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                              </td>
                            </tr>
                            <tr>
                              <td style="height:10px;"></td>
                            </tr>
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${brand.text};">
                                <strong style="display:inline-block; min-width:84px;">Heure</strong>
                                ${startDate.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                              </td>
                            </tr>
                            ${registration.events.venue ? `
                            <tr><td style="height:10px;"></td></tr>
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${brand.text};">
                                <strong style="display:inline-block; min-width:84px;">Lieu</strong>
                                ${registration.events.venue}
                              </td>
                            </tr>` : ``}
                            ${registration.events.city ? `
                            <tr><td style="height:10px;"></td></tr>
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${brand.text};">
                                <strong style="display:inline-block; min-width:84px;">Ville</strong>
                                ${registration.events.city}
                              </td>
                            </tr>` : ``}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Spacer -->
                    <div style="height:16px;"></div>

                    <!-- Ticket block -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${brand.divider}; border-radius:12px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <table role="presentation" width="100%">
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:16px; font-weight:700; color:${brand.text};">
                                Détails du billet
                              </td>
                            </tr>
                            <tr><td style="height:8px;"></td></tr>
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${brand.text};">
                                <strong>Participant :</strong> ${registration.users.display_name || registration.users.email}
                              </td>
                            </tr>
                            ${registration.ticket_types ? `
                            <tr><td style="height:6px;"></td></tr>
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${brand.text};">
                                <strong>Type :</strong> ${registration.ticket_types.name}
                              </td>
                            </tr>` : ``}
                            <tr><td style="height:6px;"></td></tr>
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${brand.text};">
                                <strong>Prix :</strong> ${ticketPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${registration.ticket_types?.currency ?? "EUR"}
                              </td>
                            </tr>
                            <tr><td style="height:6px;"></td></tr>
                            <tr>
                              <td style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${brand.text};">
                                <strong>N° billet :</strong> ${registration.id}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <div style="text-align:center; padding:24px 0 8px;">
                      <a href="${pdfUrl}"
                         style="background:${brand.accent}; color:#111827; text-decoration:none; display:inline-block; padding:14px 22px; border-radius:10px; font-family:Arial,Helvetica,sans-serif; font-weight:800; font-size:15px; letter-spacing:0.2px;"
                         class="btn">
                        Télécharger mon billet (PDF)
                      </a>
                    </div>

                    <!-- Note grise (remplace l'ancien bloc jaune) -->
                    <div style="margin-top:14px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:${brand.subtext}; line-height:1.5; text-align:center;">
                      Présentez ce billet (imprimé ou sur mobile) à l'entrée.<br>
                      Le QR code du PDF sera scanné pour valider l'accès.
                    </div>

                    <!-- Divider -->
                    <div style="height:24px;"></div>
                    <div style="border-top:1px solid ${brand.divider};"></div>

                    <!-- Footer -->
                    <div style="font-family:Arial,Helvetica,sans-serif; color:${brand.subtext}; font-size:12px; text-align:center; padding-top:16px;">
                      Merci d'avoir choisi Panache Esport.<br>
                      Besoin d'aide ? Répondez directement à cet e-mail.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:24px;"></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const safeTitle = String(registration.events.title || "evenement")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const emailData = {
      sender: {
        name: "Panache Esport",
        email: "noreply@panache-esport.com",
      },
      to: [
        {
          email: registration.users.email,
          name: registration.users.display_name || registration.users.email,
        },
      ],
      subject: `Votre billet pour ${registration.events.title}`,
      htmlContent: html,
      attachment: [
        {
          name: `billet-${safeTitle}.pdf`,
          url: pdfUrl,
        },
      ],
    };

    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(emailData),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Brevo API error:", errorData);
      throw new Error(`Failed to send email: ${errorData.message || "Unknown error"}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending ticket email:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});