import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import jsPDF from "https://esm.sh/jspdf@2.5.1";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting ticket PDF generation");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { registrationId } = await req.json();
    console.log("Registration ID:", registrationId);

    // Récupérer les données de la registration avec toutes les infos nécessaires
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
          organizations (
            name,
            logo_url
          )
        ),
        ticket_types (
          name,
          price_cents,
          currency
        ),
        users (
          display_name,
          email
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      throw new Error("Registration not found");
    }

    console.log("Registration data loaded");

    // Générer le QR code
    const qrData = {
      registrationId: registration.id,
      eventId: registration.event_id,
      userId: registration.user_id,
      ticketType: registration.ticket_types?.name,
      timestamp: new Date().toISOString()
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log("QR code generated");

    // Créer le PDF
    const doc = new jsPDF();
    
    // Configuration des couleurs
    const primaryColor = [59, 130, 246]; // Blue-500
    const textColor = [31, 41, 55]; // Gray-800
    const lightColor = [243, 244, 246]; // Gray-100

    // Header avec couleur de fond
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLET D\'ÉVÉNEMENT', 105, 25, { align: 'center' });

    // Informations de l'événement
    doc.setTextColor(...textColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(registration.events.title, 20, 60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Date et heure
    const startDate = new Date(registration.events.starts_at);
    doc.text(`Date: ${startDate.toLocaleDateString('fr-FR')}`, 20, 80);
    doc.text(`Heure: ${startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 20, 90);
    
    // Lieu
    if (registration.events.venue) {
      doc.text(`Lieu: ${registration.events.venue}`, 20, 100);
    }
    if (registration.events.city) {
      doc.text(`Ville: ${registration.events.city}`, 20, 110);
    }

    // Type de billet et prix
    if (registration.ticket_types) {
      doc.text(`Type: ${registration.ticket_types.name}`, 20, 130);
      const price = registration.ticket_types.price_cents / 100;
      doc.text(`Prix: ${price}€`, 20, 140);
    }

    // Participant
    doc.text(`Participant: ${registration.users?.display_name || registration.users?.email}`, 20, 160);
    
    // QR Code
    doc.addImage(qrCodeDataURL, 'PNG', 140, 70, 50, 50);
    doc.setFontSize(10);
    doc.text('Scannez ce code à l\'entrée', 140, 130, { align: 'left' });

    // Numéro de billet
    doc.setFontSize(8);
    doc.text(`Numéro de billet: ${registration.id}`, 20, 280);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 120, 280);

    // Footer
    doc.setFillColor(...lightColor);
    doc.rect(0, 250, 210, 47, 'F');
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.text('Panache Esport - Plateforme de billetterie sportive', 105, 265, { align: 'center' });
    doc.text('Présentez ce billet (imprimé ou numérique) à l\'entrée', 105, 275, { align: 'center' });

    // Convertir en base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    
    console.log("PDF generated");

    // Upload vers Supabase Storage
    const fileName = `ticket-${registration.id}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('event-images')
      .upload(`tickets/${fileName}`, new Uint8Array(Buffer.from(pdfBase64, 'base64')), {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload PDF");
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabaseClient.storage
      .from('event-images')
      .getPublicUrl(`tickets/${fileName}`);

    // Mettre à jour la registration avec les URLs
    const { error: updateError } = await supabaseClient
      .from('registrations')
      .update({
        ticket_pdf_url: urlData.publicUrl,
        ticket_qr_url: qrCodeDataURL
      })
      .eq('id', registrationId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    console.log("Ticket PDF generated successfully");

    return new Response(JSON.stringify({
      success: true,
      pdfUrl: urlData.publicUrl,
      qrCode: qrCodeDataURL
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating ticket PDF:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});