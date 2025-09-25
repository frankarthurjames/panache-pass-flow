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
    if (!registrationId) throw new Error("Missing registrationId");
    console.log("Registration ID:", registrationId);

    // ---- Fetch registration + relations
    const { data: registration, error: regError } = await supabaseClient
      .from("registrations")
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
      .eq("id", registrationId)
      .single();

    if (regError || !registration) throw new Error("Registration not found");
    console.log("Registration data loaded");

    // ---- Palette (alignée avec l'email : orange)
    const palette = {
      text: [15, 23, 42],        // slate-900
      sub: [71, 85, 105],        // slate-600
      line: [226, 232, 240],     // slate-200
      accent: [249, 115, 22],    // #F97316
      accentDark: [234, 88, 12], // #EA580C
      soft: [255, 247, 237],     // orange-50
      white: [255, 255, 255],
    };

    // ---- Data formatting
    const safe = (v: unknown) => (v ?? "").toString();
    const orgName = safe(registration.events.organizations?.name || "Panache Esport");
    const orgLogo = safe(registration.events.organizations?.logo_url || "");
    const eventTitle = safe(registration.events.title);
    const startDate = new Date(registration.events.starts_at);
    const endDate = registration.events.ends_at ? new Date(registration.events.ends_at) : null;
    const venue = safe(registration.events.venue);
    const city = safe(registration.events.city);
    const attendee = safe(registration.users?.display_name || registration.users?.email || "");
    const ticketType = safe(registration.ticket_types?.name || "");
    const price = registration.ticket_types?.price_cents ? (registration.ticket_types.price_cents / 100) : null;
    const currency = safe(registration.ticket_types?.currency || "EUR");

    // ---- QR payload (URL de validation)
    const baseUrl = Deno.env.get("APP_BASE_URL") || "https://panache-esport.com";
    const validationUrl = `${baseUrl.replace(/\/+$/,"")}/validate-ticket?registrationId=${registration.id}&eventId=${registration.event_id}&userId=${registration.user_id}`;

    const qr = qrcode(0, "M");
    qr.addData(validationUrl);
    qr.make();
    const moduleCount = qr.getModuleCount();

    // ---- PDF
    // A4 mm, portrait
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const page = { w: 210, h: 297 };
    const margin = 20;

    // Helpers
    const setText = (rgb: number[]) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    const setLine = (rgb: number[]) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    const setFill = (rgb: number[]) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);

    const drawDivider = (x: number, y: number, w: number) => {
      setLine(palette.line);
      doc.setLineWidth(0.3);
      doc.line(x, y, x + w, y);
    };

    const titleY = margin;
    const contentY = titleY + 22;
    const rightColX = page.w - margin - 70; // QR / colonne droite
    const leftColX = margin;

    // ---- Header (logo + brand + ticket id / date)
    // Ligne 1: logo/brand gauche, ID/date droite
    setText(palette.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    if (orgLogo) {
      // Tentative d'affichage logo si accessible (base64 non requis si public)
      try {
        // jsPDF accepte les images par URL data; si URL http(s), cela ne marchera pas côté edge.
        // On garde un fallback texte (ci-dessous) ; on n'échoue pas si le logo ne se charge pas.
        // @ts-ignore
        await doc.addImage(orgLogo, "PNG", leftColX, titleY - 2, 28, 10);
      } catch {
        doc.text(orgName, leftColX, titleY + 6);
      }
    } else {
      doc.text(orgName, leftColX, titleY + 6);
    }

    // Ticket ID + date/heure à droite
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const now = new Date();
    const rightMetaX = page.w - margin;
    setText(palette.sub);
    doc.text(`ID ${registration.id}`, rightMetaX, titleY + 1, { align: "right" });
    doc.text(
      `${now.toLocaleDateString("fr-FR")} · ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
      rightMetaX,
      titleY + 6,
      { align: "right" }
    );

    // Titre événement
    doc.setFont("helvetica", "bold");
    setText(palette.text);
    doc.setFontSize(16);
    const titleMaxW = page.w - margin * 2;
    const splitTitle = doc.splitTextToSize(eventTitle, titleMaxW);
    doc.text(splitTitle, margin, titleY + 18);

    drawDivider(margin, contentY - 4, page.w - margin * 2);

    // ---- Grille 2 colonnes: Left = détails, Right = QR
    // LEFT: blocs info
    let y = contentY + 4;

    const label = (t: string, px = 0) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setText(palette.accentDark);
      doc.text(t.toUpperCase(), leftColX + px, y);
      y += 5;
    };
    const value = (t: string, px = 0) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      setText(palette.text);
      const lines = doc.splitTextToSize(t, rightColX - leftColX - 6 - px);
      doc.text(lines, leftColX + px, y);
      y += (lines.length * 5.2) + 4;
    };

    // Date & heure
    label("Date & heure");
    value(
      `${startDate.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
    );
    value(
      `${startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` +
      (endDate ? ` – ${endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "")
    );

    // Lieu
    if (venue || city) {
      label("Lieu");
      value([venue, city].filter(Boolean).join(" · "));
    }

    // Titulaire
    label("Titulaire du billet");
    value(attendee);

    // Type & prix
    if (ticketType || price !== null) {
      label("Billet");
      value(
        [ticketType, (price !== null ? `${price.toFixed(2)} ${currency}` : "")].filter(Boolean).join(" · ")
      );
    }

    // Référence d'accès (courte)
    label("Référence");
    value(registration.id);

    // RIGHT: QR code fixé dans un cadre propre, parfaitement aligné
    // Carré de 70x70 mm moins marges internes
    const qrBoxSize = 70;
    const qrBoxX = rightColX;
    const qrBoxY = contentY + 4;

    // Cadre léger
    setLine(palette.line);
    doc.setLineWidth(0.4);
    doc.rect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    // Rendu QR: on calcule une cellule + "quiet zone" de 4 modules
    const quiet = 4; // modules
    const usable = qrBoxSize - 10; // padding interne (mm) : 5mm de chaque côté
    const modulesWithQuiet = moduleCount + quiet * 2;
    const cell = usable / modulesWithQuiet;
    const startX = qrBoxX + 5 + quiet * cell;
    const startY = qrBoxY + 5 + quiet * cell;

    // Fond blanc propre
    setFill(palette.white);
    doc.rect(qrBoxX + 2, qrBoxY + 2, qrBoxSize - 4, qrBoxSize - 4, "F");

    // Dessin des modules
    doc.setFillColor(0, 0, 0);
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.isDark(r, c)) {
          doc.rect(startX + c * cell, startY + r * cell, cell, cell, "F");
        }
      }
    }
    console.log("QR code generated");

    // Légende sous le QR
    setText(palette.sub);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Présenter ce QR lors du contrôle d'accès", qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 6, {
      align: "center",
    });

    // ---- Conditions (micro-texte, tout en bas)
    const conditionsYStart = page.h - margin - 30;
    drawDivider(margin, conditionsYStart, page.w - margin * 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setText(palette.accentDark);
    doc.text("Conditions d'accès", margin, conditionsYStart + 6);

    doc.setFont("helvetica", "normal");
    setText(palette.sub);
    doc.setFontSize(7);
    const conditions = [
      "Billet personnel et non transférable. Une pièce d'identité peut être demandée.",
      "Présenter le billet au format papier ou numérique avec le QR code parfaitement lisible.",
      "L'accès pourra être refusé en cas de billet déjà validé, altéré ou contrefait.",
      `Organisateur : ${orgName || "Non spécifié"}. Lieu et horaires susceptibles d'évoluer, consulter les communications officielles.`,
      "Toute sortie peut être définitive selon les conditions de l'organisateur. Règlement intérieur applicable sur site.",
    ].join(" ");
    const condLines = doc.splitTextToSize(conditions, page.w - margin * 2);
    doc.text(condLines, margin, conditionsYStart + 11);

    // ---- Footer (ligne fine + métadonnées)
    drawDivider(margin, page.h - margin - 10, page.w - margin * 2);
    doc.setFontSize(7);
    setText(palette.sub);
    const hash = btoa(`${registration.id}|${registration.event_id}|${registration.user_id}`).slice(0, 14);
    doc.text(
      `Généré le ${now.toLocaleDateString("fr-FR")} ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · Réf: ${registration.id} · Hash: ${hash}`,
      margin,
      page.h - margin - 4
    );

    console.log("PDF generated");

    // ---- Export PDF (base64)
    const pdfBase64 = doc.output("datauristring").split(",")[1];

    // ---- Upload to Supabase Storage
    const safeTitle = String(eventTitle || "evenement")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const fileName = `ticket-${registration.id}.pdf`;

    // Convert base64 → bytes
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("event-images")
      .upload(`tickets/${fileName}`, bytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload PDF");
    }

    const { data: urlData } = supabaseClient.storage
      .from("event-images")
      .getPublicUrl(`tickets/${fileName}`);

    // Préparer aussi une version SVG du QR si besoin dans l'app/email
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${moduleCount} ${moduleCount}" shape-rendering="crispEdges">`;
    svg += `<rect width="100%" height="100%" fill="#FFFFFF"/>`;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.isDark(r, c)) svg += `<rect x="${c}" y="${r}" width="1" height="1" fill="#000000"/>`;
      }
    }
    svg += `</svg>`;
    const qrCodeSvgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    console.log("QR code SVG generated");

    // ---- Persist ticket URLs & QR payload
    const { error: updateError } = await supabaseClient
      .from("registrations")
      .update({
        ticket_pdf_url: urlData.publicUrl,
        ticket_qr_url: qrCodeSvgDataUrl,
        qr_code: validationUrl, // on stocke la payload URL utile pour le scan
      })
      .eq("id", registrationId);

    if (updateError) console.error("Update error:", updateError);

    console.log("Ticket PDF generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl: urlData.publicUrl,
        qrCode: qrCodeSvgDataUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error generating ticket PDF:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});