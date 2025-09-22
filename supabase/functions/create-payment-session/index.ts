import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    console.log("Creating payment session");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authentifier l'utilisateur
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Récupérer les données de la requête
    const { eventId, ticketTypes } = await req.json();
    console.log("Payment request:", { eventId, ticketTypes });

    // Récupérer les données de l'événement et de l'organisation
    const { data: eventData, error: eventError } = await supabaseClient
      .from('events')
      .select(`
        *,
        organizations!inner (
          id,
          name,
          stripe_account_id
        )
      `)
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      throw new Error("Event not found");
    }

    const organization = eventData.organizations;
    if (!organization.stripe_account_id) {
      throw new Error("Organization has no Stripe account connected");
    }

    console.log("Event and organization data loaded");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Vérifier si l'utilisateur a déjà un customer Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Créer une commande dans la base de données
    const totalCents = ticketTypes.reduce((sum: number, ticket: any) => 
      sum + (ticket.price_cents * ticket.quantity), 0
    );

    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        event_id: eventId,
        total_cents: totalCents,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    console.log("Order created:", orderData.id);

    // Créer les items de commande
    const orderItems = ticketTypes.map((ticket: any) => ({
      order_id: orderData.id,
      ticket_type_id: ticket.id,
      qty: ticket.quantity,
      unit_price_cents: ticket.price_cents
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw new Error("Failed to create order items");
    }

    // Calculer les frais de la marketplace (5%)
    const applicationFeeAmount = Math.round(totalCents * 0.05);

    // Préparer les line items pour Stripe
    const lineItems = ticketTypes.map((ticket: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${eventData.title} - ${ticket.name}`,
          description: `Billet pour ${eventData.title}`,
        },
        unit_amount: ticket.price_cents,
      },
      quantity: ticket.quantity,
    }));

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Créer la session de paiement Stripe avec Connect
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderData.id}`,
      cancel_url: `${origin}/events/${eventId}?payment=cancelled`,
      metadata: {
        order_id: orderData.id,
        event_id: eventId,
      },
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: organization.stripe_account_id,
        },
      },
    });

    console.log("Stripe session created:", session.id);

    // Mettre à jour la commande avec l'ID de session Stripe
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderData.id);

    if (updateError) {
      console.error("Error updating order with session ID:", updateError);
    }

    return new Response(JSON.stringify({ 
      sessionUrl: session.url,
      sessionId: session.id,
      orderId: orderData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-payment-session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});