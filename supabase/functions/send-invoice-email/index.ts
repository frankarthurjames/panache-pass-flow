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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { orderId, invoiceUrl, invoiceId } = await req.json();

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        events (
          title,
          starts_at,
          venue,
          city
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Send email with invoice link
    const emailRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-brevo-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to: user.email,
        templateKey: 'invoice',
        params: {
          user_name: user.email.split('@')[0],
          event_title: order.events.title,
          order_id: order.id.slice(-8).toUpperCase(),
          invoice_url: invoiceUrl,
          invoice_id: invoiceId,
          total_amount: (order.total_cents / 100).toFixed(2)
        }
      })
    });

    const emailResult = await emailRes.json();

    if (!emailRes.ok) {
      throw new Error(`Email sending failed: ${emailResult.error}`);
    }

    console.log(`Invoice email sent successfully for order ${orderId}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Invoice email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending invoice email:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});