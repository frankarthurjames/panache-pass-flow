import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import jsPDF from "https://esm.sh/jspdf@2.5.1";
import qrcode from "https://esm.sh/qrcode-generator@1.4.4";

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

    // Générer le QR code avec URL de validation (sans canvas)
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

    // Utilise qrcode-generator (compatible Deno/Edge) pour créer la matrice
    const qr = qrcode(0, 'M');
    qr.addData(validationUrl);
    qr.make();

    // Créer une version SVG (pour stockage/email) sans dépendre de canvas
    const moduleCount = qr.getModuleCount();
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${moduleCount} ${moduleCount}" shape-rendering="crispEdges">`;
    svg += `<rect width="100%" height="100%" fill="#FFFFFF"/>`;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.isDark(r, c)) {
          svg += `<rect x="${c}" y="${r}" width="1" height="1" fill="#000000"/>`;
        }
      }
    }
    svg += `</svg>`;
    const qrCodeSvgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

    console.log("QR code SVG generated");

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
    doc.rect(0, 0, 210, 50, 'F');
    
    // Logo Panache avec style moderne
    doc.setTextColor(...white);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('PANACHE', 20, 25);
    
    // Badge "BILLET OFFICIEL"
    doc.setFillColor(...accentColor);
    doc.rect(20, 32, 70, 12, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLET OFFICIEL', 23, 40);

    // Numéro de billet et date (corner supérieur droit)
    doc.setTextColor(...white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${registration.id.substring(0, 8).toUpperCase()}`, 155, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date().toLocaleDateString('fr-FR')}`, 155, 30);
    doc.text(`${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 155, 38);

    // === SECTION ÉVÉNEMENT ===
    doc.setFillColor(...white);
    doc.rect(0, 50, 210, 90, 'F');
    
    // Titre événement avec style moderne
    doc.setTextColor(...textColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    
    const eventTitle = registration.events.title;
    const maxWidth = 120;
    const splitTitle = doc.splitTextToSize(eventTitle, maxWidth);
    doc.text(splitTitle, 20, 70);

    // Date et heure avec design propre
    const startDate = new Date(registration.events.starts_at);
    const endDate = new Date(registration.events.ends_at);
    
    // Box pour date/heure
    doc.setFillColor(...lightGray);
    doc.rect(20, 85, 80, 25, 'F');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1);
    doc.rect(20, 85, 80, 25, 'S');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('DATE & HEURE', 23, 94);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    doc.text(`${startDate.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 23, 101);
    doc.text(`${startDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${endDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`, 23, 107);

    // Box pour lieu
    doc.setFillColor(...lightGray);
    doc.rect(20, 115, 80, 20, 'F');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1);
    doc.rect(20, 115, 80, 20, 'S');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('LIEU', 23, 124);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    if (registration.events.venue && registration.events.city) {
      doc.text(`${registration.events.venue}`, 23, 130);
      doc.text(`${registration.events.city}`, 23, 135);
    } else if (registration.events.venue || registration.events.city) {
      doc.text(`${registration.events.venue || registration.events.city}`, 23, 130);
    }

    // === QR CODE SECTION ===
    // Box moderne pour QR Code
    doc.setFillColor(...white);
    doc.rect(110, 85, 65, 50, 'F');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(2);
    doc.rect(110, 85, 65, 50, 'S');
    
      // QR Code rendu direct sans canvas (dessin des modules dans le PDF)
      try {
        const qrSize = 40; // mm
        const qrX = 122.5;
        const qrY = 92;
        const cell = qrSize / moduleCount;
        doc.setFillColor(0, 0, 0);
        for (let r = 0; r < moduleCount; r++) {
          for (let c = 0; c < moduleCount; c++) {
            if (qr.isDark(r, c)) {
              doc.rect(qrX + c * cell, qrY + r * cell, cell, cell, 'F');
            }
          }
        }
      } catch (e) {
        console.error("QR Code draw error:", e);
        // Fallback avec message d'erreur stylé
        doc.setFillColor(...lightGray);
        doc.rect(122.5, 92, 40, 40, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...darkGray);
        doc.text('QR Code', 142.5, 110, { align: 'center' });
        doc.text('Non disponible', 142.5, 118, { align: 'center' });
      }
    
    // Instructions de scan
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('SCANNER À L\'ENTRÉE', 142.5, 130, { align: 'center' });

    // === SECTION PARTICIPANT ===
    doc.setFillColor(...white);
    doc.rect(0, 140, 210, 40, 'F');
    
    // Box pour participant
    doc.setFillColor(...lightGray);
    doc.rect(20, 150, 80, 25, 'F');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1);
    doc.rect(20, 150, 80, 25, 'S');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('TITULAIRE DU BILLET', 23, 159);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    const participantName = registration.users?.display_name || registration.users?.email || 'Non spécifié';
    doc.text(participantName, 23, 166);
    
    if (registration.users?.email) {
      doc.setFontSize(8);
      doc.setTextColor(...darkGray);
      doc.text(registration.users.email, 23, 172);
    }

    // === SECTION TYPE DE BILLET ===
    if (registration.ticket_types) {
      // Box moderne pour le type de billet
      doc.setFillColor(...accentColor);
      doc.rect(110, 150, 65, 25, 'F');
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(1);
      doc.rect(110, 150, 65, 25, 'S');
      
      doc.setTextColor(...white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(registration.ticket_types.name.toUpperCase(), 113, 159);
      
      const price = registration.ticket_types.price_cents / 100;
      doc.setFontSize(12);
      doc.text(`${price.toFixed(2)} ${registration.ticket_types.currency || 'EUR'}`, 113, 169);
    }

    // === CONDITIONS ET SÉCURITÉ ===
    doc.setFillColor(...lightGray);
    doc.rect(0, 180, 210, 40, 'F');
    
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS D\'ACCÈS', 20, 190);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('• Ce billet est personnel et non transférable', 20, 198);
    doc.text('• Présentez ce billet (papier ou numérique) + pièce d\'identité', 20, 204);
    doc.text('• Accès refusé si billet déjà validé ou contrefait', 20, 210);
    doc.text('• Organisateur: ' + (registration.events.organizations?.name || 'Non spécifié'), 20, 216);

    // === FOOTER SÉCURISÉ ===
    doc.setFillColor(...primaryColor);
    doc.rect(0, 220, 210, 25, 'F');
    
    doc.setTextColor(...white);
    doc.setFontSize(7);
    doc.text(`Billet généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 230);
    doc.text('Panache © - Plateforme officielle de billetterie sportive', 20, 236);
    
    // Hash de sécurité (simple)
    const securityHash = btoa(registration.id + registration.event_id + registration.user_id).substring(0, 12);
    doc.text(`Hash: ${securityHash}`, 140, 230);
    doc.text(`ID: ${registration.id}`, 140, 236);

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
            ticket_qr_url: qrCodeSvgDataUrl,
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
      qrCode: qrCodeSvgDataUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating ticket PDF:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});