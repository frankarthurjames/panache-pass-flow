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
    console.log("Starting connect account creation");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authentifier l'utilisateur
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Récupérer les données de la requête
    const { organizationId, organizationName, organizationEmail } = await req.json();
    console.log("Request data:", { organizationId, organizationName, organizationEmail });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    // Créer un compte Stripe Connect
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: organizationEmail,
      business_profile: {
        name: organizationName,
        support_email: organizationEmail,
        product_description: 'Organisation d\'événements sportifs',
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log("Stripe account created:", account.id);

    // Créer un lien d'onboarding
    const rawOrigin = req.headers.get("origin") || "http://localhost:3000";
    // S'assurer que l'URL utilise HTTPS en production
    const origin = rawOrigin.replace(/^http:/, "https:");
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/dashboard/org/${organizationId}/settings?refresh=true`,
      return_url: `${origin}/dashboard/org/${organizationId}/settings?success=true`,
      type: 'account_onboarding',
    });

    console.log("Account link created:", accountLink.url);

    // Sauvegarder l'ID du compte Stripe dans la base
    const { error: updateError } = await supabaseClient
      .from('organizations')
      .update({ stripe_account_id: account.id })
      .eq('id', organizationId);

    if (updateError) {
      console.error("Error updating organization:", updateError);
      throw updateError;
    }

    console.log("Organization updated with Stripe account ID");

    return new Response(JSON.stringify({ 
      accountId: account.id,
      onboardingUrl: accountLink.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-connect-account:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});