import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FinalizeOrderRequest {
  sessionId: string;
  orderId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Utilisateur non authentifié");
    }
    const user = userData.user;

    const { sessionId, orderId }: FinalizeOrderRequest = await req.json();
    if (!sessionId) throw new Error("sessionId manquant");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY manquant");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    console.log("[FINALIZE-ORDER] Retrieving session", { sessionId });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Paiement non confirmé" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load the order by session id (preferred)
    let { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, user_id, event_id, total_cents, stripe_payment_intent")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (!order && orderId) {
      const alt = await supabase
        .from("orders")
        .select("id, status, user_id, event_id, total_cents, stripe_payment_intent")
        .eq("id", orderId)
        .maybeSingle();
      order = alt.data ?? null;
      orderErr = alt.error ?? null;
    }

    if (orderErr) throw orderErr;
    if (!order) throw new Error("Commande introuvable");

    // Ensure the order belongs to the current user
    if (order.user_id !== user.id) {
      throw new Error("Cette commande n'appartient pas à l'utilisateur connecté");
    }

    // If already paid, return the hydrated order
    if (order.status === "paid") {
      const full = await supabase
        .from("orders")
        .select(`
          *,
          events ( id, title, starts_at, venue, city ),
          order_items ( qty, unit_price_cents, ticket_type_id, ticket_types ( name ) )
        `)
        .eq("id", order.id)
        .maybeSingle();

      return new Response(JSON.stringify({ order: full.data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load order items
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("id, qty, unit_price_cents, ticket_type_id")
      .eq("order_id", order.id);
    if (itemsErr) throw itemsErr;
    if (!items || items.length === 0) throw new Error("Aucun article dans la commande");

    // Create registrations (service role bypasses RLS)
    const registrations: any[] = [];
    for (const item of items) {
      for (let i = 0; i < item.qty; i++) {
        registrations.push({
          event_id: order.event_id,
          ticket_type_id: item.ticket_type_id,
          order_id: order.id,
          user_id: order.user_id,
          status: "issued",
        });
      }
    }

    console.log("[FINALIZE-ORDER] Creating registrations", { count: registrations.length });
    const { data: createdRegs, error: regErr } = await supabase
      .from("registrations")
      .insert(registrations)
      .select();
    if (regErr) throw regErr;

    // Update order status + payment intent
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;
    const { error: updErr } = await supabase
      .from("orders")
      .update({ status: "paid", stripe_payment_intent: paymentIntentId })
      .eq("id", order.id);
    if (updErr) throw updErr;

    // Insert payment record
    const amountCents = session.amount_total ?? order.total_cents;
    const currency = (session.currency ?? "eur").toUpperCase();
    const { error: payErr } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,
        amount_cents: amountCents,
        currency,
        provider: "stripe",
        provider_event: session.id,
        raw_payload: session as any,
      });
    if (payErr) throw payErr;

    // Try to generate tickets and send emails, but don't fail the whole flow if it breaks
    for (const reg of createdRegs ?? []) {
      try {
        const pdfRes = await supabase.functions.invoke("generate-ticket-pdf", {
          body: { registrationId: reg.id },
        });
        if (pdfRes.data?.success && pdfRes.data?.pdfUrl) {
          await supabase.functions.invoke("send-ticket-email", {
            body: { registrationId: reg.id, pdfUrl: pdfRes.data.pdfUrl },
          });
        } else {
          console.log("[FINALIZE-ORDER] PDF generation failed", pdfRes.error);
        }
      } catch (e) {
        console.log("[FINALIZE-ORDER] Ticket generation/send error", e);
      }
    }

    // Return full order for UI
    const { data: fullOrder, error: fullErr } = await supabase
      .from("orders")
      .select(`
        *,
        events ( id, title, starts_at, venue, city ),
        order_items ( qty, unit_price_cents, ticket_types ( name ) )
      `)
      .eq("id", order.id)
      .maybeSingle();
    if (fullErr) throw fullErr;

    return new Response(JSON.stringify({ order: fullOrder }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[FINALIZE-ORDER] ERROR", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
