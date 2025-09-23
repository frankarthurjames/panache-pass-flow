import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-12-18.acacia",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer l'utilisateur depuis le token
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { orderId } = await req.json();

    // Récupérer la commande avec l'ID de session Stripe
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('stripe_session_id, stripe_payment_intent_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    let invoice = null;
    let receiptUrl = null;

    // Essayer de récupérer la facture via l'ID de session
    if (order.stripe_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        if (session.invoice) {
          invoice = await stripe.invoices.retrieve(session.invoice);
        }
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
        }
      } catch (error) {
        console.log("Could not retrieve invoice from session:", error);
      }
    }

    // Essayer de récupérer via l'ID de payment intent
    if (!invoice && order.stripe_payment_intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        if (paymentIntent.invoice) {
          invoice = await stripe.invoices.retrieve(paymentIntent.invoice);
        }
        receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
      } catch (error) {
        console.log("Could not retrieve invoice from payment intent:", error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      invoice: invoice ? {
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        created: invoice.created,
        due_date: invoice.due_date,
        paid: invoice.paid,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        lines: invoice.lines?.data || []
      } : null,
      receiptUrl: receiptUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error getting Stripe invoice:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
