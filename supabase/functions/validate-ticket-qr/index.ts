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

    const { qrData } = await req.json();
    console.log("QR Data received:", qrData);

    // Parser les données QR
    let parsedQrData;
    try {
      parsedQrData = JSON.parse(qrData);
    } catch (error) {
      throw new Error("Format QR code invalide");
    }

    const { registrationId, eventId, userId, ticketType, timestamp } = parsedQrData;

    if (!registrationId || !eventId || !userId) {
      throw new Error("Données QR code incomplètes");
    }

    // Vérifier que la registration existe et est valide
    const { data: registration, error: regError } = await supabaseClient
      .from('registrations')
      .select(`
        *,
        events (
          id,
          title,
          starts_at,
          ends_at,
          venue,
          city,
          status,
          organizations (
            name,
            logo_url
          )
        ),
        ticket_types (
          name,
          price_cents
        ),
        users (
          display_name,
          email
        ),
        orders (
          id,
          status,
          total_cents
        )
      `)
      .eq('id', registrationId)
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (regError || !registration) {
      throw new Error("Billet non trouvé");
    }

    // Vérifier que la commande est payée
    if (registration.orders?.status !== 'paid') {
      throw new Error("Billet non payé");
    }

    // Vérifier que l'événement est actif
    if (registration.events?.status !== 'published') {
      throw new Error("Événement non disponible");
    }

    // Vérifier les dates de l'événement
    const now = new Date();
    const eventStart = new Date(registration.events.starts_at);
    const eventEnd = new Date(registration.events.ends_at);

    let validationStatus = 'valid';
    let message = 'Billet valide';

    if (now < eventStart) {
      validationStatus = 'upcoming';
      message = 'Billet valide - Événement à venir';
    } else if (now > eventEnd) {
      validationStatus = 'expired';
      message = 'Billet expiré - Événement terminé';
    } else {
      validationStatus = 'active';
      message = 'Billet valide - Événement en cours';
    }

    // Enregistrer la validation (optionnel)
    const { error: validationError } = await supabaseClient
      .from('ticket_validations')
      .insert({
        registration_id: registrationId,
        validated_at: new Date().toISOString(),
        validated_by: 'qr_scanner', // ou l'ID de l'utilisateur qui scanne
        status: validationStatus
      });

    if (validationError) {
      console.log("Could not save validation:", validationError);
      // Ne pas faire échouer la validation pour ça
    }

    return new Response(JSON.stringify({
      success: true,
      valid: true,
      status: validationStatus,
      message: message,
      ticket: {
        id: registration.id,
        event: {
          title: registration.events.title,
          starts_at: registration.events.starts_at,
          ends_at: registration.events.ends_at,
          venue: registration.events.venue,
          city: registration.events.city,
          organization: registration.events.organizations?.name
        },
        ticket_type: {
          name: registration.ticket_types?.name,
          price_cents: registration.ticket_types?.price_cents
        },
        user: {
          name: registration.users?.display_name || registration.users?.email,
          email: registration.users?.email
        },
        order: {
          id: registration.orders?.id,
          total_cents: registration.orders?.total_cents,
          status: registration.orders?.status
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error validating ticket QR:", error);
    return new Response(JSON.stringify({ 
      success: false,
      valid: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
