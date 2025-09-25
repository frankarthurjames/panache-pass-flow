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
    console.log("Checking connect status");

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

    // Récupérer l'ID de l'organisation
    const { organizationId } = await req.json();
    console.log("Organization ID:", organizationId);

    // Vérifier que l'utilisateur a accès à cette organisation
    const { data: memberData, error: memberError } = await supabaseClient
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !memberData) {
      console.error("User is not a member of this organization:", memberError);
      throw new Error("Access denied");
    }

    // Récupérer les données de l'organisation (avec service role, pas de RLS)
    const { data: orgData, error: orgError } = await supabaseClient
      .from('organizations')
      .select('stripe_account_id')
      .eq('id', organizationId)
      .single();

    if (orgError || !orgData) {
      console.error("Error fetching organization:", orgError);
      throw new Error("Organization not found");
    }

    if (!orgData.stripe_account_id) {
      return new Response(JSON.stringify({ 
        connected: false,
        details_submitted: false,
        charges_enabled: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    // Vérifier le statut du compte Stripe
    const account = await stripe.accounts.retrieve(orgData.stripe_account_id);
    console.log("Account status:", {
      id: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled
    });

    return new Response(JSON.stringify({
      connected: true,
      accountId: account.id,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      business_profile: account.business_profile
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in check-connect-status:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});