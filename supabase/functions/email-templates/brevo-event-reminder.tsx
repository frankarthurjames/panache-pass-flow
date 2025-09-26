import * as React from 'npm:react@18.3.1'

interface EventReminderEmailProps {
  userName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  eventCity: string
  ticketsCount: number
  organizerName: string
  specialInstructions?: string
}

export const EventReminderEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventVenue,
  eventCity,
  ticketsCount,
  organizerName,
  specialInstructions,
}: EventReminderEmailProps) => {
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

  const preheader = `Rappel : ${eventTitle} c'est bientôt !`;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Rappel : {eventTitle}</title>
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
                          <span style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"12px", color:"#CBD5E1"}}>Rappel</span>
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
                            ⏰ C'est bientôt !
                          </div>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:"#FFE4D5", fontSize:"14px", marginTop:"8px"}}>
                            {organizerName} × Panache Esport
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="card" style={{background:brand.card, padding:"28px"}}>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.text, fontSize:"20px", fontWeight:"700", margin:"0 0 8px 0"}}>
                            Bonjour {userName},
                          </div>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.subtext, fontSize:"14px", margin:"0 0 16px 0"}}>
                            Nous espérons que vous êtes aussi excité que nous ! Votre événement <strong>{eventTitle}</strong> a lieu <strong>bientôt</strong>.
                          </div>

                          {/* Event details */}
                          <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{borderCollapse:"separate", borderSpacing:"0", background:brand.softBg, borderRadius:"12px"}}>
                            <tr>
                              <td style={{padding:"18px 20px"}}>
                                <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"18px", fontWeight:"700", color:brand.text, marginBottom:"4px", textAlign:"center"}}>
                                  {eventTitle}
                                </div>
                                <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"13px", color:brand.subtext, marginBottom:"16px", textAlign:"center"}}>
                                  Organisé par {organizerName}
                                </div>
                                <table role="presentation" width="100%">
                                  <tr>
                                    <td style={{width:"20px", verticalAlign:"top", paddingTop:"2px"}}>📅</td>
                                    <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text, paddingBottom:"8px"}}>
                                      <strong>Date :</strong> {eventDate}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{width:"20px", verticalAlign:"top", paddingTop:"2px"}}>🕐</td>
                                    <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text, paddingBottom:"8px"}}>
                                      <strong>Heure :</strong> {eventTime}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{width:"20px", verticalAlign:"top", paddingTop:"2px"}}>📍</td>
                                    <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text, paddingBottom:"8px"}}>
                                      <strong>Lieu :</strong> {eventVenue}, {eventCity}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{width:"20px", verticalAlign:"top", paddingTop:"2px"}}>🎫</td>
                                    <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                      <strong>Vos billets :</strong> {ticketsCount} billet{ticketsCount > 1 ? 's' : ''}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          {/* Important reminders */}
                          <div style={{margin:"20px 0"}}>
                            <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"16px", fontWeight:"700", color:brand.text, marginBottom:"12px"}}>
                              N'oubliez pas :
                            </div>
                            
                            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{border:`1px solid ${brand.divider}`, borderRadius:"12px"}}>
                              <tr>
                                <td style={{padding:"16px 20px"}}>
                                  <table role="presentation" width="100%">
                                    <tr>
                                      <td style={{width:"20px", verticalAlign:"top", paddingTop:"2px"}}>✅</td>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text, paddingBottom:"8px"}}>
                                        Arrivez 15 minutes avant le début pour éviter les files d'attente
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{width:"20px", verticalAlign:"top", paddingTop:"2px"}}>✅</td>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text, paddingBottom:"8px"}}>
                                        Apportez votre billet (version numérique ou imprimée)
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{width:"20px", verticalAlign:"top", paddingTop:"2px"}}>✅</td>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text, paddingBottom:"8px"}}>
                                        Portez une tenue de sport adaptée à l'activité
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{width:"20px", verticalAlign:"top", paddingTop:"2px"}}>✅</td>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                        N'oubliez pas votre bouteille d'eau et une serviette
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </div>

                          {/* Special instructions */}
                          {specialInstructions && (
                            <div style={{margin:"16px 0"}}>
                              <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"16px", fontWeight:"700", color:brand.text, marginBottom:"8px"}}>
                                Instructions spéciales
                              </div>
                              <div style={{padding:"12px", background:"#FEF3C7", border:"1px solid #F59E0B", borderRadius:"8px"}}>
                                <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:"#92400E"}}>
                                  {specialInstructions}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Weather reminder */}
                          <div style={{margin:"16px 0", padding:"16px", background:"#F1F5F9", border:`1px solid ${brand.divider}`, borderRadius:"12px"}}>
                            <table role="presentation" width="100%">
                              <tr>
                                <td style={{width:"30px", verticalAlign:"top"}}>
                                  <span style={{fontSize:"20px"}}>🌤️</span>
                                </td>
                                <td>
                                  <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", fontWeight:"700", color:brand.text, marginBottom:"4px"}}>
                                    Pensez à vérifier la météo
                                  </div>
                                  <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"12px", color:brand.subtext}}>
                                    Consultez les prévisions météo pour vous habiller en conséquence
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </div>

                          {/* Action buttons */}
                          <div style={{textAlign:"center", margin:"24px 0"}}>
                            <a href="#"
                               style={{background:brand.accent, color:"#111827", textDecoration:"none", display:"inline-block", padding:"12px 20px", borderRadius:"8px", fontFamily:"Arial,Helvetica,sans-serif", fontWeight:"700", fontSize:"14px", marginBottom:"8px", marginRight:"8px"}}
                               className="btn">
                              Voir mes billets
                            </a>
                            <a href="#"
                               style={{background:"transparent", border:`2px solid ${brand.accent}`, color:brand.accent, textDecoration:"none", display:"inline-block", padding:"10px 18px", borderRadius:"8px", fontFamily:"Arial,Helvetica,sans-serif", fontWeight:"700", fontSize:"14px"}}>
                              Itinéraire vers le lieu
                            </a>
                          </div>

                          {/* Excitement section */}
                          <div style={{textAlign:"center", margin:"20px 0", padding:"16px", background:brand.softBg, borderRadius:"12px", border:`2px solid #FED7AA`}}>
                            <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"16px", fontWeight:"700", color:brand.accent}}>
                              🎉 Nous avons hâte de vous voir ! 🎉
                            </div>
                          </div>

                          {/* Contact text */}
                          <div style={{marginTop:"16px", fontFamily:"Arial,Helvetica,sans-serif", fontSize:"12px", color:brand.subtext, lineHeight:"1.5", textAlign:"center"}}>
                            Une question de dernière minute ? Contactez l'organisateur {organizerName} ou notre équipe support.
                          </div>

                          {/* Divider */}
                          <div style={{height:"24px"}}></div>
                          <div style={{borderTop:`1px solid ${brand.divider}`}}></div>

                          {/* Footer */}
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.subtext, fontSize:"12px", textAlign:"center", paddingTop:"16px"}}>
                            Email de rappel envoyé par Panache pour {eventTitle}<br/>
                            Mes événements • Support • Annulation
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

export default EventReminderEmail