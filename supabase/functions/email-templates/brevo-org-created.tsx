import * as React from 'npm:react@18.3.1'

interface OrgCreatedEmailProps {
    userName: string
    organizationName: string
    dashboardUrl: string
}

export const OrgCreatedEmail = ({
    userName,
    organizationName,
    dashboardUrl,
}: OrgCreatedEmailProps) => {
    const brand = {
        bg: "#0B0B0C",
        card: "#FFFFFF",
        text: "#0F172A",
        subtext: "#475569",
        divider: "#E2E8F0",
        accent: "#F97316",
        accentDark: "#EA580C",
        softBg: "#FFF7ED"
    };

    const preheader = `Votre organisation ${organizationName} est prête sur Panache !`;

    return (
        <html lang="fr">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>Organisation créée !</title>
            </head>
            <body style={{ margin: 0, padding: 0, background: brand.bg }}>
                <span style={{ display: "none", visibility: "hidden", opacity: 0, color: "transparent", height: 0, width: 0, overflow: "hidden" }}>{preheader}</span>
                <table role="presentation" cellPadding="0" cellSpacing="0" width="100%" style={{ background: brand.bg }}>
                    <tr>
                        <td align="center" style={{ padding: "24px 12px" }}>
                            <table role="presentation" cellPadding="0" cellSpacing="0" width="100%" style={{ maxWidth: "640px" }}>
                                <tr>
                                    <td style={{ padding: "16px 20px" }}>
                                        <img src="https://wlxbydzshqijlfejqafp.supabase.co/storage/v1/object/public/event-images/panache-logo-text.png" alt="Panache" height="36" style={{ display: "block", border: 0 }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0 20px" }}>
                                        <table role="presentation" width="100%" style={{ borderRadius: "16px", overflow: "hidden", background: brand.card }}>
                                            <tr>
                                                <td style={{ background: brand.accent, padding: "32px 28px", textAlign: "center" }}>
                                                    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", color: "#FFFFFF", fontSize: "26px", fontWeight: "800" }}>
                                                        🏢 Organisation confirmée
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "28px" }}>
                                                    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", color: brand.text, fontSize: "20px", fontWeight: "700", margin: "0 0 8px 0" }}>
                                                        Félicitations {userName} !
                                                    </div>
                                                    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", color: brand.subtext, fontSize: "14px", margin: "0 0 24px 0" }}>
                                                        Votre organisation <strong>{organizationName}</strong> a été créée avec succès sur Panache Esport. Vous pouvez maintenant commencer à créer des événements et gérer votre billetterie.
                                                    </div>

                                                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                                                        <a href={dashboardUrl}
                                                            style={{ background: brand.accent, color: "#111827", textDecoration: "none", display: "inline-block", padding: "14px 22px", borderRadius: "10px", fontFamily: "Arial,Helvetica,sans-serif", fontWeight: "800", fontSize: "15px" }}
                                                        >
                                                            Accéder au Dashboard
                                                        </a>
                                                    </div>

                                                    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: `1px solid ${brand.divider}`, fontFamily: "Arial,Helvetica,sans-serif", fontSize: "12px", color: brand.subtext, textAlign: "center" }}>
                                                        Besoin d'aide pour configurer votre organisation ?<br />
                                                        Consultez notre documentation ou contactez le support.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    );
}

export default OrgCreatedEmail
