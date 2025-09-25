import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
// Utiliser une approche plus simple sans Puppeteer pour éviter les problèmes de dépendances

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting receipt PDF generation");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { orderId } = await req.json();
    console.log("Order ID:", orderId);

    // Récupérer les détails de la commande
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
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
        order_items (
          qty,
          unit_price_cents,
          ticket_types (
            name
          )
        ),
        users (
          display_name,
          email
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    console.log("Order data loaded for receipt");

    // Générer le HTML du reçu
    const event = order.events;
    const user = order.users;
    const organization = event.organizations;
    
    const eventDate = new Date(event.starts_at);
    const orderDate = new Date(order.created_at);
    
    // Calculer le prix réel des billets (sans frais de plateforme)
    const ticketsTotal = order.order_items.reduce((sum: number, item: any) => {
      return sum + (item.unit_price_cents * item.qty);
    }, 0);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reçu - ${event.title}</title>
        <style>
          :root{
            --accent: hsl(25 95% 55%);     /* primary */
            --accent-hover: hsl(25 95% 45%); /* primary darker */
            --text: hsl(224 71% 4%);       /* foreground */
            --sub: hsl(220 9% 46%);        /* muted-foreground */
            --line: hsl(220 13% 91%);      /* border */
            --soft: hsl(25 95% 95%);       /* primary/10 */
            --success-bg: hsl(142 76% 90%); /* success background */
            --success-text: hsl(142 76% 20%); /* success text */
          }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 32px;
            background: white;
            color: var(--text);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid var(--accent);
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            height: 32px;
            margin: 0 auto 10px;
            display: block;
          }
          .receipt-title {
            font-size: 22px;
            font-weight: 700;
            margin-top: 8px;
            color: var(--text);
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 24px;
          }
          .info-section {
            flex: 1;
            min-width: 240px;
          }
          .info-title {
            font-size: 12px;
            color: var(--accent);
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .info-value {
            font-size: 14px;
            color: var(--text);
            margin-bottom: 4px;
          }
          .event-details {
            background: var(--soft);
            padding: 18px;
            border-radius: 10px;
            margin-bottom: 24px;
            border: 1px solid hsl(25 95% 85%);
          }
          .event-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
            color: var(--text);
          }
          .event-info {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }
          .event-info div {
            min-width: 180px;
            font-size: 14px;
            color: var(--text);
          }
          .tickets-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 24px;
          }
          .tickets-table th,
          .tickets-table td {
            padding: 12px 8px;
            border-bottom: 1px solid var(--line);
            font-size: 14px;
          }
          .tickets-table th {
            text-align: left;
            background: hsl(220 14% 96%);
            color: var(--accent);
            font-weight: 700;
          }
          .tickets-table .text-right {
            text-align: right;
          }
          .total-section {
            margin-top: 8px;
            padding-top: 16px;
            border-top: 2px solid var(--accent);
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
            font-size: 14px;
          }
          .total-final {
            font-weight: 800;
            font-size: 18px;
            color: var(--accent);
            border-top: 1px solid var(--line);
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 36px;
            padding-top: 18px;
            border-top: 1px solid var(--line);
            color: var(--sub);
            font-size: 12px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-paid {
            background: var(--success-bg);
            color: var(--success-text);
          }
          @media print {
            body { padding: 0 16px; }
            .header { border-bottom: 1px solid var(--line); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://wlxbydzshqijlfejqafp.supabase.co/storage/v1/object/public/event-images/panache-logo-text.png" alt="Panache" class="logo">
          <div class="receipt-title">Reçu de paiement</div>
        </div>

        <div class="receipt-info">
          <div class="info-section">
            <div class="info-title">Commande</div>
            <div class="info-value">#${order.id.slice(-8).toUpperCase()}</div>
            <div class="info-value">Le ${orderDate.toLocaleDateString('fr-FR')} à ${orderDate.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</div>
            <div class="info-value" style="margin-top:6px; font-weight:700; color:var(--accent)">
              <span class="status-badge status-paid">Payé</span>
            </div>
          </div>
          <div class="info-section">
            <div class="info-title">Client</div>
            <div class="info-value">${user?.display_name || 'Client'}</div>
            ${user?.email ? `<div class="info-value">${user.email}</div>` : ''}
          </div>
        </div>

        <div class="event-details">
          <div class="event-title">${event.title}</div>
          <div class="event-info">
            <div>
              <strong>Date:</strong><br>
              ${eventDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div>
              <strong>Heure:</strong><br>
              ${eventDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div>
              <strong>Lieu:</strong><br>
              ${[event.venue, event.city].filter(Boolean).join(', ') || 'À confirmer'}
            </div>
            ${organization?.name ? `
            <div>
              <strong>Organisateur:</strong><br>
              ${organization.name}
            </div>
            ` : ''}
          </div>
        </div>

        <table class="tickets-table">
          <thead>
            <tr>
              <th>Type de billet</th>
              <th class="text-right">Quantité</th>
              <th class="text-right">Prix unitaire</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items.map((item: any) => `
              <tr>
                <td>${item.ticket_types.name}</td>
                <td class="text-right">${item.qty}</td>
                <td class="text-right">${(item.unit_price_cents / 100).toFixed(2)}€</td>
                <td class="text-right">${((item.unit_price_cents * item.qty) / 100).toFixed(2)}€</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          ${order.platform_fee_cents ? `
            <div class="total-line">
              <span>Prix des billets:</span>
              <span>${(ticketsTotal / 100).toFixed(2)}€</span>
            </div>
            <div class="total-line">
              <span>Frais de plateforme:</span>
              <span>${(order.platform_fee_cents / 100).toFixed(2)}€</span>
            </div>
          ` : `
            <div class="total-line">
              <span>Prix des billets:</span>
              <span>${(ticketsTotal / 100).toFixed(2)}€</span>
            </div>
          `}
          <div class="total-line total-final">
            <span>Total payé:</span>
            <span>${(order.total_cents / 100).toFixed(2)}€</span>
          </div>
        </div>

        <div class="footer">
          <p>Merci d'avoir choisi ${organization?.name || 'Panache'}. Ce reçu confirme votre inscription à l'événement.</p>
          <p style="margin-top: 12px; color: var(--sub); font-size: 10px; line-height: 1.5;">
            Ce document est généré automatiquement. Conservez-le. Tous les prix indiqués sont TTC (TVA incluse).
            Les frais de plateforme sont inclus dans le total payé. Pour toute question, contactez l'organisateur ou le support.
            <br>Réf. commande: ${order.id}.
          </p>
        </div>
      </body>
      </html>
    `;

    // Pour l'instant, retourner le HTML directement
    // Le client pourra l'imprimer ou le convertir en PDF
    const htmlFileName = `receipt-${order.id}-${Date.now()}.html`;
    
    // Uploader le HTML vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('receipts')
      .upload(htmlFileName, htmlContent, {
        contentType: 'text/html',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error("Error uploading HTML:", uploadError);
      throw new Error("Failed to upload HTML");
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabaseClient.storage
      .from('receipts')
      .getPublicUrl(htmlFileName);

    console.log("Receipt HTML generated successfully:", publicUrl);

    return new Response(JSON.stringify({
      success: true,
      pdfUrl: publicUrl,
      fileName: htmlFileName
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
