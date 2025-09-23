import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from 'npm:@react-email/components@0.0.22'
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
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue sur Panache - Votre plateforme d'événements sportifs</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Panache branding */}
        <Section style={header}>
          <div style={logoContainer}>
            <img src="https://wlxbydzshqijlfejqafp.supabase.co/storage/v1/object/public/event-images/panache-logo-text.png" alt="Panache" style={logoImage} />
          </div>
        </Section>

        {/* Welcome message */}
        <Section style={content}>
          <Heading style={h1}>Bienvenue {userName} !</Heading>
          
          <Text style={text}>
            Félicitations ! Votre compte sur <strong>Panache</strong> a été créé avec succès.
          </Text>

          <Text style={text}>
            Vous pouvez maintenant créer et gérer vos événements sportifs, 
            vendre des billets et analyser vos performances.
          </Text>

          {organizationName && (
            <div style={organizationCard}>
              <Text style={organizationTitle}>Organisation :</Text>
              <Text style={organizationName}>{organizationName}</Text>
            </div>
          )}

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link href={loginUrl} style={button}>
              Accéder à mon dashboard
            </Link>
          </Section>

          {/* Features list */}
          <Section style={featuresSection}>
            <Heading style={featuresTitle}>Découvrez vos fonctionnalités :</Heading>
            <div style={featureItem}>
              <span style={featureIcon}>🎾</span>
              <Text style={featureText}>Créez des événements sportifs en quelques clics</Text>
            </div>
            <div style={featureItem}>
              <span style={featureIcon}>🎫</span>
              <Text style={featureText}>Vendez des billets avec Stripe intégré</Text>
            </div>
            <div style={featureItem}>
              <span style={featureIcon}>📊</span>
              <Text style={featureText}>Analysez vos performances et revenus</Text>
            </div>
            <div style={featureItem}>
              <span style={featureIcon}>👥</span>
              <Text style={featureText}>Gérez vos participants et équipes</Text>
            </div>
          </Section>

          <Text style={helpText}>
            Besoin d'aide ? Consultez notre <Link href="#" style={link}>guide de démarrage</Link> ou 
            contactez notre équipe support.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Cet email a été envoyé par Panache - La plateforme des événements sportifs
          </Text>
          <div style={footerLinks}>
            <Link href="#" style={footerLink}>Centre d'aide</Link>
            <span style={separator}>•</span>
            <Link href="#" style={footerLink}>Politique de confidentialité</Link>
            <span style={separator}>•</span>
            <Link href="#" style={footerLink}>Se désabonner</Link>
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

// Styles using Panache design system colors
const main = {
  backgroundColor: 'hsl(210, 20%, 98%)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 0',
  textAlign: 'center' as const,
  borderBottom: '1px solid hsl(220, 13%, 91%)',
}

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const logoImage = {
  height: '48px',
  width: 'auto',
}

const content = {
  padding: '32px 24px',
}

const h1 = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const organizationCard = {
  backgroundColor: 'hsl(25, 95%, 95%)',
  border: '2px solid hsl(25, 95%, 85%)',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const organizationTitle = {
  color: 'hsl(25, 95%, 40%)',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const organizationName = {
  color: 'hsl(25, 95%, 30%)',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: 'hsl(25, 95%, 55%)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  boxShadow: '0 4px 30px -4px hsl(25, 95%, 55%, 0.25)',
}

const featuresSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: 'hsl(220, 14%, 96%)',
  borderRadius: '12px',
}

const featuresTitle = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 20px',
}

const featureItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  margin: '12px 0',
}

const featureIcon = {
  fontSize: '20px',
  width: '24px',
  textAlign: 'center' as const,
}

const featureText = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '14px',
  margin: '0',
  lineHeight: '20px',
}

const helpText = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const footer = {
  padding: '24px 0',
  borderTop: '1px solid hsl(220, 13%, 91%)',
  textAlign: 'center' as const,
}

const footerText = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '12px',
  margin: '0 0 16px',
}

const footerLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
}

const footerLink = {
  color: 'hsl(25, 95%, 55%)',
  fontSize: '12px',
  textDecoration: 'none',
}

const separator = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '12px',
}

const link = {
  color: 'hsl(25, 95%, 55%)',
  textDecoration: 'none',
}