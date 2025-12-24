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

    // Parser les données QR - supporter URL et JSON
    let parsedQrData;
    try {
      // Si c'est une URL (nouveau format)
      if (typeof qrData === 'string' && qrData.includes('/validate-ticket?')) {
        const url = new URL(qrData);
        parsedQrData = {
          registrationId: url.searchParams.get('registrationId'),
          eventId: url.searchParams.get('eventId'),
          userId: url.searchParams.get('userId')
        };
      } else {
        // Ancien format JSON
        parsedQrData = JSON.parse(qrData);
      }
    } catch (error) {
      throw new Error("Format QR code invalide");
    }

    const { registrationId, eventId, userId } = parsedQrData;

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

    // Calculer si l'événement dure plusieurs jours (plus de 20 heures)
    const eventDurationHours = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
    const isMultiDayEvent = eventDurationHours > 20;

    console.log(`Event duration: ${eventDurationHours} hours, is multi-day: ${isMultiDayEvent}`);

    // VÉRIFIER LES VALIDATIONS EXISTANTES
    const { data: existingValidations, error: validationCheckError } = await supabaseClient
      .from('ticket_validations')
      .select('id, validated_at, status')
      .eq('registration_id', registrationId)
      .order('validated_at', { ascending: false });

    if (validationCheckError) {
      console.log("Error checking existing validations:", validationCheckError);
    }

    // Vérifier s'il y a déjà une validation aujourd'hui
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const validationToday = existingValidations?.find(v => {
      const validationDate = new Date(v.validated_at);
      return validationDate >= todayStart && validationDate <= todayEnd;
    });

    // Logique de validation selon le type d'événement
    if (validationToday) {
      if (isMultiDayEvent) {
        // Pour les événements multi-jours : mettre à jour la dernière validation du jour
        const lastValidationTime = new Date(validationToday.validated_at).toLocaleTimeString('fr-FR');
        throw new Error(`Billet déjà scanné aujourd'hui à ${lastValidationTime}. Pour les événements multi-jours, un seul scan par jour est autorisé.`);
      } else {
        // Pour les événements d'un jour : refuser complètement
        const validationDate = new Date(validationToday.validated_at);
        throw new Error(`Billet déjà validé le ${validationDate.toLocaleDateString('fr-FR')} à ${validationDate.toLocaleTimeString('fr-FR')}`);
      }
    }

    // Déterminer le statut de validation
    let validationStatus = 'valid';
    let message = 'Billet valide';

    if (now < eventStart) {
      validationStatus = 'upcoming';
      message = isMultiDayEvent ? 
        'Billet valide - Événement multi-jours à venir' : 
        'Billet valide - Événement à venir';
    } else if (now > eventEnd) {
      validationStatus = 'expired';
      message = 'Billet expiré - Événement terminé';
    } else {
      validationStatus = 'active';
      const dayNumber = existingValidations ? existingValidations.length + 1 : 1;
      message = isMultiDayEvent ? 
        `Billet valide - Jour ${dayNumber} de l'événement` : 
        'Billet valide - Événement en cours';
    }

    // Enregistrer la nouvelle validation
    const { error: validationError } = await supabaseClient
      .from('ticket_validations')
      .insert({
        registration_id: registrationId,
        validated_at: new Date().toISOString(),
        validated_by: 'qr_scanner',
        status: validationStatus
      });

    if (validationError) {
      console.error("CRITICAL: Could not save validation:", validationError);
      throw new Error("Erreur lors de l'enregistrement de la validation");
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
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});



