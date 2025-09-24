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

    // Générer le QR code sous format SVG pour éviter les problèmes canvas
    const qrCodeSVG = await QRCode.toString(JSON.stringify(qrData), {
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Convertir SVG en base64 pour l'utiliser dans le PDF
    const qrCodeDataURL = `data:image/svg+xml;base64,${btoa(qrCodeSVG)}`;

    console.log("QR code generated");

    // Créer le PDF professionnel
    const doc = new jsPDF();
    
    // Configuration des couleurs
    const primaryColor = [0, 48, 135]; // Bleu professionnel
    const accentColor = [255, 215, 0]; // Or
    const textColor = [31, 41, 55]; // Gris foncé
    const lightGray = [248, 250, 252];
    const darkGray = [107, 114, 128];

    // === HEADER PRINCIPAL ===
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Logo et titre principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PANACHE', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('BILLET D\'ACCÈS OFFICIEL', 20, 35);

    // Numéro de billet (corner supérieur droit)
    doc.setFontSize(10);
    doc.text(`#${registration.id.substring(0, 8).toUpperCase()}`, 170, 20);
    doc.text(`${new Date().toLocaleDateString('fr-FR')}`, 170, 30);

    // === SECTION ÉVÉNEMENT ===
    doc.setFillColor(...lightGray);
    doc.rect(0, 50, 210, 80, 'F');
    
    doc.setTextColor(...textColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    
    // Titre événement (avec gestion de la longueur)
    const eventTitle = registration.events.title;
    const maxWidth = 120;
    const splitTitle = doc.splitTextToSize(eventTitle, maxWidth);
    doc.text(splitTitle, 20, 70);

    // Date et heure avec icônes
    const startDate = new Date(registration.events.starts_at);
    const endDate = new Date(registration.events.ends_at);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('📅 DATE & HEURE', 20, 95);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.text(`${startDate.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 105);
    doc.text(`De ${startDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} à ${endDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`, 20, 115);

    // Lieu avec icône
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('📍 LIEU', 20, 125);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    if (registration.events.venue && registration.events.city) {
      doc.text(`${registration.events.venue}`, 20, 135);
      doc.text(`${registration.events.city}`, 20, 145);
    } else if (registration.events.venue || registration.events.city) {
      doc.text(`${registration.events.venue || registration.events.city}`, 20, 135);
    }

    // === QR CODE SECTION ===
    // Fond pour QR Code
    doc.setFillColor(255, 255, 255);
    doc.rect(145, 65, 60, 60, 'F');
    doc.setDrawColor(...darkGray);
    doc.rect(145, 65, 60, 60, 'S');
    
    // QR Code
    try {
      doc.addImage(qrCodeDataURL, 'SVG', 150, 70, 50, 50);
    } catch (e) {
      // Fallback si SVG ne marche pas
      doc.setFontSize(8);
      doc.text('QR Code Error', 175, 95, { align: 'center' });
    }
    
    doc.setFontSize(8);
    doc.setTextColor(...darkGray);
    doc.text('SCANNER À L\'ENTRÉE', 175, 130, { align: 'center' });

    // === SECTION PARTICIPANT ===
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 150, 210, 40, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('👤 TITULAIRE DU BILLET', 20, 165);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    const participantName = registration.users?.display_name || registration.users?.email || 'Non spécifié';
    doc.text(participantName, 20, 175);
    
    if (registration.users?.email) {
      doc.setFontSize(10);
      doc.setTextColor(...darkGray);
      doc.text(registration.users.email, 20, 185);
    }

    // === SECTION TYPE DE BILLET ===
    if (registration.ticket_types) {
      doc.setFillColor(...accentColor);
      doc.rect(120, 155, 80, 25, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(registration.ticket_types.name.toUpperCase(), 125, 165);
      
      const price = registration.ticket_types.price_cents / 100;
      doc.setFontSize(14);
      doc.text(`${price.toFixed(2)} ${registration.ticket_types.currency || 'EUR'}`, 125, 175);
    }

    // === CONDITIONS ET SÉCURITÉ ===
    doc.setFillColor(...lightGray);
    doc.rect(0, 200, 210, 60, 'F');
    
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS D\'ACCÈS:', 20, 215);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('• Ce billet est personnel et non transférable', 20, 225);
    doc.text('• Présentez ce billet (papier ou numérique) + pièce d\'identité', 20, 235);
    doc.text('• Accès refusé si billet déjà validé ou contrefait', 20, 245);
    doc.text('• Organisateur: ' + (registration.events.organizations?.name || 'Non spécifié'), 20, 255);

    // === FOOTER SÉCURISÉ ===
    doc.setFillColor(...primaryColor);
    doc.rect(0, 270, 210, 27, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Billet généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 280);
    doc.text('Panache © - Plateforme officielle de billetterie sportive', 20, 290);
    
    // Hash de sécurité (simple)
    const securityHash = btoa(registration.id + registration.event_id + registration.user_id).substring(0, 12);
    doc.text(`Hash: ${securityHash}`, 150, 280);
    doc.text(`ID: ${registration.id}`, 150, 290);

    // Convertir en base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    
    console.log("PDF generated");

    // Upload vers Supabase Storage
    const fileName = `ticket-${registration.id}.pdf`;
    
    // Convertir base64 en Uint8Array pour Deno
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('event-images')
      .upload(`tickets/${fileName}`, bytes, {
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
        ticket_qr_url: qrCodeDataURL,
        qr_code: JSON.stringify(qrData)
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