import * as React from 'npm:react@18.3.1'

interface CapacityAlertEmailProps {
    eventName: string
    percentage: number
    ticketsSold: number
    totalCapacity: number
    dashboardUrl: string
}

export const CapacityAlertEmail = ({
    eventName,
    percentage,
    ticketsSold,
    totalCapacity,
    dashboardUrl,
}: CapacityAlertEmailProps) => {
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

    const isFull = percentage >= 100;
    const emoji = isFull ? "🔥" : "📈";
    const title = isFull ? "Événement Complet !" : `Capacité à ${percentage}%`;
    const preheader = `${emoji} ${eventName} est à ${percentage}% de sa capacité !`;

    return (
        <html lang="fr">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>Alerte Capacité</title>
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
                                                <td style={{ background: isFull ? brand.accentDark : brand.accent, padding: "32px 28px", textAlign: "center" }}>
                                                    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", color: "#FFFFFF", fontSize: "26px", fontWeight: "800" }}>
                                                        {emoji} {title}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "28px" }}>
                                                    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", color: brand.text, fontSize: "20px", fontWeight: "700", margin: "0 0 8px 0" }}>
                                                        Succès pour {eventName} !
                                                    </div>
                                                    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", color: brand.subtext, fontSize: "14px", margin: "0 0 24px 0" }}>
                                                        Votre événement vient d'atteindre un nouveau palier de réservations.
                                                    </div>

                                                    <table role="presentation" width="100%" style={{ background: brand.softBg, borderRadius: "12px", margin: "16px 0" }}>
                                                        <tr>
                                                            <td style={{ padding: "20px", textAlign: "center" }}>
                                                                <div style={{ fontFamily: "Arial,Helvetica,sans-serif", fontSize: "32px", color: brand.accent, fontWeight: "800" }}>
                                                                    {percentage}%
                                                                </div>
                                                                <div style={{ fontFamily: "Arial,Helvetica,sans-serif", fontSize: "14px", color: brand.text, marginTop: "4px" }}>
                                                                    <strong>{ticketsSold}</strong> billets vendus sur <strong>{totalCapacity}</strong>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                                                        <a href={dashboardUrl}
                                                            style={{ background: brand.accent, color: "#111827", textDecoration: "none", display: "inline-block", padding: "14px 22px", borderRadius: "10px", fontFamily: "Arial,Helvetica,sans-serif", fontWeight: "800", fontSize: "15px" }}
                                                        >
                                                            Voir les statistiques
                                                        </a>
                                                    </div>

                                                    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: `1px solid ${brand.divider}`, fontFamily: "Arial,Helvetica,sans-serif", fontSize: "12px", color: brand.subtext, textAlign: "center" }}>
                                                        C'est le moment idéal pour booster votre communication !<br />
                                                        Panache Esport • Dashboard Organisateur
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

export default CapacityAlertEmail
