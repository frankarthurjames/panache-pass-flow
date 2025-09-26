import * as React from 'npm:react@18.3.1'

interface EventConfirmationEmailProps {
  userName: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  eventCity: string
  ticketTypes: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  qrCodeUrl?: string
}

export const EventConfirmationEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventVenue,
  eventCity,
  ticketTypes,
  totalAmount,
  qrCodeUrl,
}: EventConfirmationEmailProps) => {
  // Couleurs brand Panache (orange)
  const brand = {
    bg: "#0B0B0C",            // fond global très sombre pour encadrer
    card: "#FFFFFF",          // cartes / blocs
    text: "#0F172A",          // slate-900
    subtext: "#475569",       // slate-600
    divider: "#E2E8F0",       // slate-200
    accent: "#F97316",        // orange-500
    accentDark: "#EA580C",    // orange-600 (hover)
    softBg: "#FFF7ED"         // orange-50 (fond doux de section)
  };

  const preheader = `Votre billet pour ${eventTitle} est prêt !`;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Votre billet pour {eventTitle}</title>
        <style>
          {`.preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; }
          @media (prefers-color-scheme: dark) {
            .dark-bg { background:${brand.bg} !important; }
            .card { background:#111827 !important; color:#F9FAFB !important; }
            .text { color:#F3F4F6 !important; }
            .subtext { color:#D1D5DB !important; }
            .divider { border-color:#374151 !important; }
            .btn { color:#111827 !important; }
          }`}
        </style>
      </head>
      <body style={{margin:0, padding:0, background:brand.bg}}>
        <span className="preheader">{preheader}</span>
        <table role="presentation" cellPadding="0" cellSpacing="0" width="100%" className="dark-bg" style={{background:brand.bg}}>
          <tr>
            <td align="center" style={{padding:"24px 12px"}}>
              {/* Container */}
              <table role="presentation" cellPadding="0" cellSpacing="0" width="100%" style={{maxWidth:"640px"}}>
                {/* Header */}
                <tr>
                  <td style={{padding:"16px 20px"}}>
                    <table role="presentation" width="100%">
                      <tr>
                        <td align="left" style={{verticalAlign:"middle"}}>
                          <img src="https://wlxbydzshqijlfejqafp.supabase.co/storage/v1/object/public/event-images/panache-logo-text.png" alt="Panache" height="36" style={{display:"block", border:0, outline:"none", textDecoration:"none", height:"36px"}} />
                        </td>
                        <td align="right" style={{verticalAlign:"middle"}}>
                          <span style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"12px", color:"#CBD5E1"}}>Confirmation</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Hero */}
                <tr>
                  <td style={{padding:"0 20px"}}>
                    <table role="presentation" width="100%" style={{borderRadius:"16px", overflow:"hidden"}}>
                      <tr>
                        <td style={{background:brand.accent, padding:"32px 28px", textAlign:"center"}}>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:"#FFFFFF", fontSize:"26px", lineHeight:"1.25", fontWeight:"800", letterSpacing:"0.2px"}}>
                            🎫 Inscription confirmée !
                          </div>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:"#FFE4D5", fontSize:"14px", marginTop:"8px"}}>
                            Panache Esport
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="card" style={{background:brand.card, padding:"28px"}}>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.text, fontSize:"20px", fontWeight:"700", margin:"0 0 8px 0"}}>
                            Bonjour {userName},
                          </div>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.subtext, fontSize:"14px", margin:"0 0 16px 0"}}>
                            Votre inscription à <strong>{eventTitle}</strong> a été confirmée avec succès.
                          </div>

                          {/* Event details */}
                          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{borderCollapse:"separate", borderSpacing:"0", background:brand.softBg, borderRadius:"12px"}}>
                            <tr>
                              <td style={{padding:"18px 20px"}}>
                                <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"18px", fontWeight:"700", color:brand.text, marginBottom:"12px"}}>
                                  {eventTitle}
                                </div>
                                <table role="presentation" width="100%">
                                  <tr>
                                    <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                      <strong style={{display:"inline-block", minWidth:"60px"}}>Date</strong>
                                      {eventDate}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{height:"8px"}}></td>
                                  </tr>
                                  <tr>
                                    <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                      <strong style={{display:"inline-block", minWidth:"60px"}}>Lieu</strong>
                                      {eventVenue}, {eventCity}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          {/* Spacer */}
                          <div style={{height:"16px"}}></div>

                          {/* Ticket details */}
                          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{border:`1px solid ${brand.divider}`, borderRadius:"12px"}}>
                            <tr>
                              <td style={{padding:"18px 20px"}}>
                                <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"16px", fontWeight:"700", color:brand.text, marginBottom:"12px"}}>
                                  Détails de votre réservation
                                </div>
                                
                                {ticketTypes.map((ticket, index) => (
                                  <table key={index} role="presentation" width="100%" style={{marginBottom: index < ticketTypes.length - 1 ? "8px" : "0"}}>
                                    <tr>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                        {ticket.name} x{ticket.quantity}
                                      </td>
                                      <td align="right" style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text, fontWeight:"700"}}>
                                        {ticket.price > 0 ? `${(ticket.price / 100).toFixed(2)} €` : 'Gratuit'}
                                      </td>
                                    </tr>
                                  </table>
                                ))}
                                
                                <div style={{borderTop:`1px solid ${brand.divider}`, margin:"12px 0 8px", paddingTop:"8px"}}>
                                  <table role="presentation" width="100%">
                                    <tr>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"16px", fontWeight:"700", color:brand.text}}>
                                        Total
                                      </td>
                                      <td align="right" style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"16px", fontWeight:"700", color:brand.text}}>
                                        {totalAmount > 0 ? `${(totalAmount / 100).toFixed(2)} €` : 'Gratuit'}
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </table>

                          {/* QR Code if available */}
                          {qrCodeUrl && (
                            <>
                              <div style={{height:"16px"}}></div>
                              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{border:`1px solid ${brand.divider}`, borderRadius:"12px"}}>
                                <tr>
                                  <td style={{padding:"18px 20px", textAlign:"center"}}>
                                    <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"16px", fontWeight:"700", color:brand.text, marginBottom:"12px"}}>
                                      Votre billet
                                    </div>
                                    <div style={{display:"inline-block", padding:"12px", background:"#FFFFFF", border:`1px solid ${brand.divider}`, borderRadius:"8px"}}>
                                      <img src={qrCodeUrl} alt="QR Code" style={{width:"120px", height:"120px", display:"block"}} />
                                    </div>
                                    <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"12px", color:brand.subtext, marginTop:"8px"}}>
                                      Présentez ce QR code à l'entrée
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </>
                          )}

                          {/* Important note */}
                          <div style={{marginTop:"16px", padding:"12px", background:"#FEF3C7", border:"1px solid #F59E0B", borderRadius:"8px"}}>
                            <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:"#92400E"}}>
                              <strong>Important :</strong> Arrivez 15 minutes avant le début. Conservez cet email comme preuve d'achat.
                            </div>
                          </div>

                          {/* Help text */}
                          <div style={{marginTop:"16px", fontFamily:"Arial,Helvetica,sans-serif", fontSize:"12px", color:brand.subtext, lineHeight:"1.5", textAlign:"center"}}>
                            Des questions ? Contactez l'organisateur.
                          </div>

                          {/* Divider */}
                          <div style={{height:"24px"}}></div>
                          <div style={{borderTop:`1px solid ${brand.divider}`}}></div>

                          {/* Footer */}
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.subtext, fontSize:"12px", textAlign:"center", paddingTop:"16px"}}>
                            Panache - Plateforme de billetterie sportive
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style={{height:"24px"}}></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

export default EventConfirmationEmail