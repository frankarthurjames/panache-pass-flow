import * as React from 'npm:react@18.3.1'

interface PostEventThanksEmailProps {
    userName: string
    eventTitle: string
    organizerName: string
    feedbackUrl?: string
}

export const PostEventThanksEmail = ({
    userName,
    eventTitle,
    organizerName,
    feedbackUrl,
}: PostEventThanksEmailProps) => {
    const brand = {
        bg: "#F8FAFC",
        card: "#FFFFFF",
        text: "#0F172A",
        subtext: "#475569",
        divider: "#E2E8F0",
        accent: "#F97316",
        softBg: "#FFF7ED"
    };

    return (
        <html lang="fr">
            <head>
                <title>Merci d'avoir participé à {eventTitle}</title>
            </head>
            <body style={{ margin: 0, padding: 0, background: brand.bg, fontFamily: "sans-serif" }}>
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ background: brand.bg, padding: "40px 20px" }}>
                    <tr>
                        <td align="center">
                            <table width="100%" style={{ maxWidth: "600px", background: brand.card, borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                                <tr>
                                    <td style={{ background: brand.accent, padding: "40px", textAlign: "center", color: "#white" }}>
                                        <h1 style={{ margin: 0, fontSize: "32px", color: "#FFFFFF" }}>MERCI ! 🎉</h1>
                                        <p style={{ margin: "10px 0 0", opacity: 0.9, color: "#FFFFFF" }}>C'était un plaisir de vous voir à {eventTitle}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "40px" }}>
                                        <p style={{ fontSize: "18px", color: brand.text }}>Bonjour {userName},</p>
                                        <p style={{ lineHeight: 1.6, color: brand.subtext }}>
                                            Toute l'équipe de <strong>{organizerName}</strong> et de <strong>Panache</strong> tenait à vous remercier pour votre participation à l'événement <strong>{eventTitle}</strong>.
                                        </p>
                                        <p style={{ lineHeight: 1.6, color: brand.subtext }}>
                                            Nous espérons que vous avez passé un excellent moment ! Votre présence a contribué à la réussite de ce rendez-vous.
                                        </p>

                                        {feedbackUrl && (
                                            <div style={{ marginTop: "30px", textAlign: "center" }}>
                                                <p style={{ fontSize: "14px", color: brand.subtext, marginBottom: "20px" }}>Votre avis nous intéresse énormément pour nous améliorer :</p>
                                                <a href={feedbackUrl} style={{ background: brand.accent, color: "#111827", padding: "16px 32px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold", fontSize: "16px", display: "inline-block" }}>
                                                    Donner mon avis
                                                </a>
                                            </div>
                                        )}

                                        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: `1px solid ${brand.divider}`, textAlign: "center", color: brand.subtext, fontSize: "14px" }}>
                                            À très bientôt pour de nouveaux événements sur Panache !<br />
                                            <strong>L'équipe Panache Esport</strong>
                                        </div>
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

export default PostEventThanksEmail;
