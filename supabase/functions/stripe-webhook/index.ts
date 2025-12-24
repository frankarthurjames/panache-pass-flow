import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Stripe webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No stripe signature found");
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    console.log("Processing event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Processing checkout session completed:", session.id);

      // Récupérer la commande
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
              id,
              name,
              stripe_account_id
            )
          )
        `)
        .eq('stripe_session_id', session.id)
        .single();

      if (orderError || !order) {
        console.error("Order not found for session:", session.id);
        return new Response("Order not found", { status: 404 });
      }

      console.log("Order found:", order.id);

      // Mettre à jour le statut de la commande
      const { error: updateOrderError } = await supabaseClient
        .from('orders')
        .update({ 
          status: 'paid',
          stripe_payment_intent: session.payment_intent
        })
        .eq('id', order.id);

      if (updateOrderError) {
        console.error("Error updating order:", updateOrderError);
        throw new Error("Failed to update order status");
      }

      // Récupérer les items de commande
      const { data: orderItems, error: itemsError } = await supabaseClient
        .from('order_items')
        .select(`
          *,
          ticket_types (
            id,
            name,
            price_cents,
            currency
          )
        `)
        .eq('order_id', order.id);

      if (itemsError || !orderItems) {
        console.error("Error fetching order items:", itemsError);
        throw new Error("Failed to fetch order items");
      }

      console.log("Order items found:", orderItems.length);

      // Créer les inscriptions (registrations)
      const registrations = [];
      for (const item of orderItems) {
        for (let i = 0; i < item.qty; i++) {
          // Générer un QR code unique
          const qrCode = `${order.id}-${item.ticket_type_id}-${i}-${Date.now()}`;
          
          const { data: registration, error: regError } = await supabaseClient
            .from('registrations')
            .insert({
              event_id: order.event_id,
              ticket_type_id: item.ticket_type_id,
              order_id: order.id,
              user_id: order.user_id,
              qr_code: qrCode,
              status: 'issued'
            })
            .select()
            .single();

          if (regError) {
            console.error("Error creating registration:", regError);
            continue;
          }

          registrations.push(registration);
        }
      }

      console.log("Created registrations:", registrations.length);

      // Enregistrer le paiement
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          order_id: order.id,
          provider: 'stripe',
          provider_event: event.id,
          amount_cents: order.total_cents,
          currency: 'EUR',
          raw_payload: event
        });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
      }

      // Envoyer les emails de confirmation pour chaque inscription
      for (const registration of registrations) {
        try {
          // Générer le PDF du billet
          const { data: pdfData, error: pdfError } = await supabaseClient.functions.invoke('generate-ticket-pdf', {
            body: { registrationId: registration.id }
          });

          if (pdfError || !pdfData?.pdfUrl) {
            console.error("Error generating PDF for registration:", registration.id, pdfError);
            continue;
          }

          // Envoyer l'email
          const { error: emailError } = await supabaseClient.functions.invoke('send-ticket-email', {
            body: { 
              registrationId: registration.id,
              pdfUrl: pdfData.pdfUrl
            }
          });

          if (emailError) {
            console.error("Error sending email for registration:", registration.id, emailError);
          } else {
            console.log("Email sent for registration:", registration.id);
          }
        } catch (err) {
          console.error("Error processing registration:", registration.id, err);
        }
      }

      console.log("Payment processing completed for order:", order.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in stripe webhook:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});



