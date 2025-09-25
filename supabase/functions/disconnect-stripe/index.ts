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
    console.log("Disconnecting Stripe account");

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

    // Vérifier que l'utilisateur est propriétaire de l'organisation
    const { data: memberData, error: memberError } = await supabaseClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (memberError || !memberData) {
      throw new Error("Not authorized to disconnect Stripe for this organization");
    }

    // Supprimer l'ID du compte Stripe de l'organisation
    const { error: updateError } = await supabaseClient
      .from('organizations')
      .update({ stripe_account_id: null })
      .eq('id', organizationId);

    if (updateError) {
      console.error("Error disconnecting Stripe:", updateError);
      throw updateError;
    }

    console.log("Stripe account disconnected successfully");

    return new Response(JSON.stringify({ 
      success: true,
      message: "Stripe account disconnected successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in disconnect-stripe:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});