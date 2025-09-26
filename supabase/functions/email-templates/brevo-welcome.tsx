import * as React from 'npm:react@18.3.1'

interface WelcomeEmailProps {
  userName: string
  organizationName: string
  loginUrl: string
}

export const WelcomeEmail = ({
  userName,
  organizationName,
  loginUrl,
}: WelcomeEmailProps) => {
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

  const preheader = `Bienvenue sur Panache ${userName} !`;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Bienvenue sur Panache !</title>
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
                          <span style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"12px", color:"#CBD5E1"}}>Bienvenue</span>
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
                            🎉 Bienvenue sur Panache !
                          </div>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:"#FFE4D5", fontSize:"14px", marginTop:"8px"}}>
                            Votre plateforme d'événements sportifs
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="card" style={{background:brand.card, padding:"28px"}}>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.text, fontSize:"20px", fontWeight:"700", margin:"0 0 8px 0"}}>
                            Bonjour {userName},
                          </div>
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.subtext, fontSize:"14px", margin:"0 0 16px 0"}}>
                            Félicitations ! Votre compte a été créé avec succès.
                          </div>

                          {/* Organization card */}
                          {organizationName && (
                            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{borderCollapse:"separate", borderSpacing:"0", background:brand.softBg, borderRadius:"12px", margin:"16px 0"}}>
                              <tr>
                                <td style={{padding:"18px 20px", textAlign:"center"}}>
                                  <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.accent, fontWeight:"700", marginBottom:"4px"}}>
                                    ORGANISATION
                                  </div>
                                  <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"18px", color:brand.text, fontWeight:"700"}}>
                                    {organizationName}
                                  </div>
                                </td>
                              </tr>
                            </table>
                          )}

                          {/* Features */}
                          <div style={{margin:"20px 0"}}>
                            <div style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"16px", fontWeight:"700", color:brand.text, marginBottom:"12px"}}>
                              Découvrez vos fonctionnalités :
                            </div>
                            
                            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{border:`1px solid ${brand.divider}`, borderRadius:"12px"}}>
                              <tr>
                                <td style={{padding:"16px 20px"}}>
                                  <table role="presentation" width="100%">
                                    <tr>
                                      <td style={{width:"30px", verticalAlign:"top", paddingTop:"2px"}}>
                                        <span style={{fontSize:"18px"}}>🎾</span>
                                      </td>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                        <strong>Créez des événements</strong> sportifs en quelques clics
                                      </td>
                                    </tr>
                                    <tr><td colSpan={2} style={{height:"10px"}}></td></tr>
                                    <tr>
                                      <td style={{width:"30px", verticalAlign:"top", paddingTop:"2px"}}>
                                        <span style={{fontSize:"18px"}}>🎫</span>
                                      </td>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                        <strong>Vendez des billets</strong> avec Stripe intégré
                                      </td>
                                    </tr>
                                    <tr><td colSpan={2} style={{height:"10px"}}></td></tr>
                                    <tr>
                                      <td style={{width:"30px", verticalAlign:"top", paddingTop:"2px"}}>
                                        <span style={{fontSize:"18px"}}>📊</span>
                                      </td>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                        <strong>Analysez vos performances</strong> et revenus
                                      </td>
                                    </tr>
                                    <tr><td colSpan={2} style={{height:"10px"}}></td></tr>
                                    <tr>
                                      <td style={{width:"30px", verticalAlign:"top", paddingTop:"2px"}}>
                                        <span style={{fontSize:"18px"}}>👥</span>
                                      </td>
                                      <td style={{fontFamily:"Arial,Helvetica,sans-serif", fontSize:"14px", color:brand.text}}>
                                        <strong>Gérez vos participants</strong> et équipes
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </div>

                          {/* CTA */}
                          <div style={{textAlign:"center", padding:"24px 0 8px"}}>
                            <a href={loginUrl}
                               style={{background:brand.accent, color:"#111827", textDecoration:"none", display:"inline-block", padding:"14px 22px", borderRadius:"10px", fontFamily:"Arial,Helvetica,sans-serif", fontWeight:"800", fontSize:"15px", letterSpacing:"0.2px"}}
                               className="btn">
                              🚀 Accéder à mon dashboard
                            </a>
                          </div>

                          {/* Help text */}
                          <div style={{marginTop:"14px", fontFamily:"Arial,Helvetica,sans-serif", fontSize:"12px", color:brand.subtext, lineHeight:"1.5", textAlign:"center"}}>
                            Besoin d'aide ? Consultez notre guide de démarrage ou<br/>
                            contactez notre équipe support.
                          </div>

                          {/* Divider */}
                          <div style={{height:"24px"}}></div>
                          <div style={{borderTop:`1px solid ${brand.divider}`}}></div>

                          {/* Footer */}
                          <div style={{fontFamily:"Arial,Helvetica,sans-serif", color:brand.subtext, fontSize:"12px", textAlign:"center", paddingTop:"16px"}}>
                            Cet email a été envoyé par Panache Esport.<br/>
                            Centre d'aide • Politique de confidentialité • Se désabonner
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

export default WelcomeEmail