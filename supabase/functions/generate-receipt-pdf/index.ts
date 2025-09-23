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
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reçu - ${event.title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .info-section {
            flex: 1;
            min-width: 200px;
            margin: 10px;
          }
          .info-title {
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          .event-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .event-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .event-info {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .event-info div {
            flex: 1;
            min-width: 150px;
          }
          .tickets-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .tickets-table th,
          .tickets-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .tickets-table th {
            background: #f8fafc;
            font-weight: bold;
            color: #3b82f6;
          }
          .tickets-table .text-right {
            text-align: right;
          }
          .total-section {
            border-top: 2px solid #3b82f6;
            padding-top: 20px;
            margin-top: 20px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total-final {
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
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
            background: #dcfce7;
            color: #166534;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Panache</div>
          <div class="receipt-title">Reçu de paiement</div>
        </div>

        <div class="receipt-info">
          <div class="info-section">
            <div class="info-title">Informations de commande</div>
            <div>Commande #${order.id.slice(-8).toUpperCase()}</div>
            <div>Date: ${orderDate.toLocaleDateString('fr-FR')}</div>
            <div>Heure: ${orderDate.toLocaleTimeString('fr-FR')}</div>
            <div>
              <span class="status-badge status-paid">Payé</span>
            </div>
          </div>
          <div class="info-section">
            <div class="info-title">Client</div>
            <div>${user.display_name || 'Client'}</div>
            <div>${user.email}</div>
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
              ${event.venue || 'À confirmer'}<br>
              ${event.city}
            </div>
            <div>
              <strong>Organisateur:</strong><br>
              ${organization.name}
            </div>
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
          <div class="total-line">
            <span>Sous-total:</span>
            <span>${((order.subtotal_cents || order.total_cents) / 100).toFixed(2)}€</span>
          </div>
          ${order.platform_fee_cents ? `
            <div class="total-line">
              <span>Frais de plateforme (2% + 0,50€/billet):</span>
              <span>${(order.platform_fee_cents / 100).toFixed(2)}€</span>
            </div>
          ` : ''}
          <div class="total-line total-final">
            <span>Total payé:</span>
            <span>${(order.total_cents / 100).toFixed(2)}€</span>
          </div>
        </div>

        <div class="footer">
          <p>Merci d'avoir choisi Panache pour vos événements sportifs !</p>
          <p>Ce reçu confirme votre inscription à l'événement. Conservez-le précieusement.</p>
          <p>Pour toute question, contactez l'organisateur ou notre support client.</p>
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
