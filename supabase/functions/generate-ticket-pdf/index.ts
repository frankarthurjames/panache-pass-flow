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

    // Générer le QR code avec URL de validation
    const qrData = {
      registrationId: registration.id,
      eventId: registration.event_id,
      userId: registration.user_id,
      ticketType: registration.ticket_types?.name,
      timestamp: new Date().toISOString()
    };

    // URL de validation que le QR code va contenir
    const baseUrl = "http://localhost:8080"; // Domaine de l'application
    const validationUrl = `${baseUrl}/validate-ticket?registrationId=${registration.id}&eventId=${registration.event_id}&userId=${registration.user_id}`;
    const qrCodeData = JSON.stringify(qrData);

    // Générer le QR code avec l'URL de validation
    const qrCodePNG = await QRCode.toDataURL(validationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log("QR code generated");

    // Créer le PDF professionnel
    const doc = new jsPDF();
    
    // Configuration des couleurs professionnelles
    const primaryColor = [15, 23, 42]; // Slate-900 - Bleu foncé moderne
    const accentColor = [59, 130, 246]; // Blue-500 - Bleu vif
    const successColor = [34, 197, 94]; // Green-500 - Vert
    const textColor = [30, 41, 59]; // Slate-800 - Gris foncé
    const lightGray = [248, 250, 252]; // Slate-50
    const darkGray = [71, 85, 105]; // Slate-600
    const white = [255, 255, 255];

    // === HEADER PRINCIPAL ===
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Logo Panache avec style moderne
    doc.setTextColor(...white);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('PANACHE', 20, 22);
    
    // Badge "BILLET OFFICIEL"
    doc.setFillColor(...accentColor);
    doc.rect(20, 28, 60, 12, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLET OFFICIEL', 25, 36);

    // Numéro de billet et date (corner supérieur droit)
    doc.setTextColor(...white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${registration.id.substring(0, 8).toUpperCase()}`, 170, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date().toLocaleDateString('fr-FR')}`, 170, 28);
    doc.text(`${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 170, 35);

    // === SECTION ÉVÉNEMENT ===
    doc.setFillColor(...white);
    doc.rect(0, 45, 210, 85, 'F');
    
    // Titre événement avec style moderne
    doc.setTextColor(...textColor);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    
    const eventTitle = registration.events.title;
    const maxWidth = 100;
    const splitTitle = doc.splitTextToSize(eventTitle, maxWidth);
    doc.text(splitTitle, 20, 65);

    // Date et heure avec design propre
    const startDate = new Date(registration.events.starts_at);
    const endDate = new Date(registration.events.ends_at);
    
    // Box pour date/heure
    doc.setFillColor(...lightGray);
    doc.rect(20, 75, 90, 25, 'F');
    doc.setDrawColor(...accentColor);
    doc.rect(20, 75, 90, 25, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('DATE & HEURE', 25, 85);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.text(`${startDate.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 25, 92);
    doc.text(`${startDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${endDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`, 25, 98);

    // Box pour lieu
    doc.setFillColor(...lightGray);
    doc.rect(20, 105, 90, 20, 'F');
    doc.setDrawColor(...accentColor);
    doc.rect(20, 105, 90, 20, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('LIEU', 25, 115);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    if (registration.events.venue && registration.events.city) {
      doc.text(`${registration.events.venue}`, 25, 120);
      doc.text(`${registration.events.city}`, 25, 125);
    } else if (registration.events.venue || registration.events.city) {
      doc.text(`${registration.events.venue || registration.events.city}`, 25, 120);
    }

    // === QR CODE SECTION ===
    // Box moderne pour QR Code
    doc.setFillColor(...white);
    doc.rect(120, 75, 80, 50, 'F');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(2);
    doc.rect(120, 75, 80, 50, 'S');
    
    // QR Code avec gestion d'erreur améliorée
    try {
      doc.addImage(qrCodePNG, 'PNG', 130, 85, 60, 60);
    } catch (e) {
      console.error("QR Code generation error:", e);
      // Fallback avec message d'erreur stylé
      doc.setFillColor(...lightGray);
      doc.rect(130, 85, 60, 60, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...darkGray);
      doc.text('QR Code', 160, 110, { align: 'center' });
      doc.text('Non disponible', 160, 120, { align: 'center' });
    }
    
    // Instructions de scan
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('SCANNER À L\'ENTRÉE', 160, 140, { align: 'center' });

    // === SECTION PARTICIPANT ===
    doc.setFillColor(...white);
    doc.rect(0, 130, 210, 50, 'F');
    
    // Box pour participant
    doc.setFillColor(...lightGray);
    doc.rect(20, 140, 90, 30, 'F');
    doc.setDrawColor(...accentColor);
    doc.rect(20, 140, 90, 30, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('TITULAIRE DU BILLET', 25, 150);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    const participantName = registration.users?.display_name || registration.users?.email || 'Non spécifié';
    doc.text(participantName, 25, 158);
    
    if (registration.users?.email) {
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text(registration.users.email, 25, 165);
    }

    // === SECTION TYPE DE BILLET ===
    if (registration.ticket_types) {
      // Box moderne pour le type de billet
      doc.setFillColor(...accentColor);
      doc.rect(120, 140, 80, 30, 'F');
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(1);
      doc.rect(120, 140, 80, 30, 'S');
      
      doc.setTextColor(...white);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(registration.ticket_types.name.toUpperCase(), 125, 150);
      
      const price = registration.ticket_types.price_cents / 100;
      doc.setFontSize(14);
      doc.text(`${price.toFixed(2)} ${registration.ticket_types.currency || 'EUR'}`, 125, 160);
    }

    // === CONDITIONS ET SÉCURITÉ ===
    doc.setFillColor(...lightGray);
    doc.rect(0, 180, 210, 50, 'F');
    
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS D\'ACCÈS', 20, 195);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('• Ce billet est personnel et non transférable', 20, 205);
    doc.text('• Présentez ce billet (papier ou numérique) + pièce d\'identité', 20, 212);
    doc.text('• Accès refusé si billet déjà validé ou contrefait', 20, 219);
    doc.text('• Organisateur: ' + (registration.events.organizations?.name || 'Non spécifié'), 20, 226);

    // === FOOTER SÉCURISÉ ===
    doc.setFillColor(...primaryColor);
    doc.rect(0, 230, 210, 30, 'F');
    
    doc.setTextColor(...white);
    doc.setFontSize(8);
    doc.text(`Billet généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 240);
    doc.text('Panache © - Plateforme officielle de billetterie sportive', 20, 248);
    
    // Hash de sécurité (simple)
    const securityHash = btoa(registration.id + registration.event_id + registration.user_id).substring(0, 12);
    doc.text(`Hash: ${securityHash}`, 150, 240);
    doc.text(`ID: ${registration.id}`, 150, 248);

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
            ticket_qr_url: qrCodePNG,
            qr_code: qrCodeData
          })
          .eq('id', registrationId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    console.log("Ticket PDF generated successfully");

    return new Response(JSON.stringify({
      success: true,
      pdfUrl: urlData.publicUrl,
      qrCode: qrCodePNG
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