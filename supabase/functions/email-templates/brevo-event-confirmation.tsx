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
  Hr,
} from 'npm:@react-email/components@0.0.22'
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
}: EventConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirmation de votre inscription à {eventTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <div style={logoContainer}>
            <div style={logoIcon}>🏆</div>
            <Heading style={logoText}>Panache</Heading>
          </div>
        </Section>

        {/* Confirmation message */}
        <Section style={content}>
          <div style={successBadge}>
            <span style={successIcon}>✅</span>
            <Text style={successText}>Inscription confirmée !</Text>
          </div>

          <Heading style={h1}>Bonjour {userName},</Heading>
          
          <Text style={text}>
            Votre inscription à <strong>{eventTitle}</strong> a été confirmée avec succès.
          </Text>

          {/* Event details card */}
          <div style={eventCard}>
            <Heading style={eventTitle}>{eventTitle}</Heading>
            
            <div style={eventDetail}>
              <span style={eventIcon}>📅</span>
              <Text style={eventText}>{eventDate}</Text>
            </div>
            
            <div style={eventDetail}>
              <span style={eventIcon}>📍</span>
              <Text style={eventText}>{eventVenue}, {eventCity}</Text>
            </div>
          </div>

          {/* Tickets summary */}
          <Section style={ticketSection}>
            <Heading style={sectionTitle}>Détail de vos billets</Heading>
            
            {ticketTypes.map((ticket, index) => (
              <div key={index} style={ticketItem}>
                <div style={ticketInfo}>
                  <Text style={ticketName}>{ticket.name}</Text>
                  <Text style={ticketQuantity}>Quantité: {ticket.quantity}</Text>
                </div>
                <Text style={ticketPrice}>
                  {ticket.price > 0 ? `${(ticket.price / 100).toFixed(2)} €` : 'Gratuit'}
                </Text>
              </div>
            ))}
            
            <Hr style={divider} />
            
            <div style={totalRow}>
              <Text style={totalLabel}>Total payé :</Text>
              <Text style={totalAmount}>
                {totalAmount > 0 ? `${(totalAmount / 100).toFixed(2)} €` : 'Gratuit'}
              </Text>
            </div>
          </Section>

          {/* QR Code section */}
          {qrCodeUrl && (
            <Section style={qrSection}>
              <Heading style={sectionTitle}>Votre billet numérique</Heading>
              <Text style={text}>
                Présentez ce QR code à l'entrée de l'événement :
              </Text>
              <div style={qrContainer}>
                <img src={qrCodeUrl} alt="QR Code" style={qrCode} />
              </div>
            </Section>
          )}

          {/* Important information */}
          <Section style={infoSection}>
            <Heading style={infoTitle}>Informations importantes</Heading>
            <div style={infoItem}>
              <span style={infoIcon}>⏰</span>
              <Text style={infoText}>
                Arrivez 15 minutes avant le début de l'événement
              </Text>
            </div>
            <div style={infoItem}>
              <span style={infoIcon}>🎫</span>
              <Text style={infoText}>
                Conservez cet email comme preuve d'achat
              </Text>
            </div>
            <div style={infoItem}>
              <span style={infoIcon}>📱</span>
              <Text style={infoText}>
                Vous pouvez aussi accéder à vos billets depuis votre compte
              </Text>
            </div>
          </Section>

          {/* CTA */}
          <Section style={buttonContainer}>
            <Link href="#" style={button}>
              Voir mes billets
            </Link>
          </Section>

          <Text style={helpText}>
            Des questions ? Contactez l'organisateur ou notre 
            <Link href="#" style={link}> équipe support</Link>.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Email envoyé par Panache pour {eventTitle}
          </Text>
          <div style={footerLinks}>
            <Link href="#" style={footerLink}>Gérer mes billets</Link>
            <span style={separator}>•</span>
            <Link href="#" style={footerLink}>Support</Link>
            <span style={separator}>•</span>
            <Link href="#" style={footerLink}>Conditions d'annulation</Link>
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EventConfirmationEmail

// Styles using Panache design system
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
  padding: '24px 0',
  textAlign: 'center' as const,
  borderBottom: '1px solid hsl(220, 13%, 91%)',
}

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
}

const logoIcon = {
  fontSize: '24px',
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  backgroundColor: 'hsl(25, 95%, 55%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'hsl(224, 71%, 4%)',
  margin: 0,
}

const content = {
  padding: '32px 24px',
}

const successBadge = {
  backgroundColor: 'hsl(142, 76%, 95%)',
  border: '2px solid hsl(142, 76%, 85%)',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}

const successIcon = {
  fontSize: '24px',
}

const successText = {
  color: 'hsl(142, 76%, 36%)',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: 0,
}

const h1 = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const text = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const eventCard = {
  background: 'linear-gradient(135deg, hsl(25, 95%, 55%), hsl(25, 95%, 70%))',
  borderRadius: '16px',
  padding: '24px',
  margin: '32px 0',
  color: '#ffffff',
}

const eventTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  color: '#ffffff',
}

const eventDetail = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  margin: '12px 0',
}

const eventIcon = {
  fontSize: '18px',
  width: '20px',
}

const eventText = {
  fontSize: '16px',
  margin: 0,
  color: '#ffffff',
  fontWeight: '500',
}

const ticketSection = {
  backgroundColor: 'hsl(220, 14%, 96%)',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
}

const sectionTitle = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 20px',
}

const ticketItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid hsl(220, 13%, 91%)',
}

const ticketInfo = {
  flex: 1,
}

const ticketName = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const ticketQuantity = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '14px',
  margin: 0,
}

const ticketPrice = {
  color: 'hsl(25, 95%, 55%)',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: 0,
}

const divider = {
  border: 'none',
  borderTop: '2px solid hsl(220, 13%, 91%)',
  margin: '16px 0',
}

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 0 0',
}

const totalLabel = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: 0,
}

const totalAmount = {
  color: 'hsl(25, 95%, 55%)',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: 0,
}

const qrSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const qrContainer = {
  backgroundColor: '#ffffff',
  border: '2px solid hsl(220, 13%, 91%)',
  borderRadius: '12px',
  padding: '20px',
  display: 'inline-block',
  margin: '16px 0',
}

const qrCode = {
  width: '150px',
  height: '150px',
}

const infoSection = {
  margin: '32px 0',
}

const infoTitle = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const infoItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  margin: '12px 0',
}

const infoIcon = {
  fontSize: '16px',
  width: '20px',
  marginTop: '2px',
}

const infoText = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '14px',
  margin: 0,
  lineHeight: '20px',
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
  padding: '14px 28px',
  boxShadow: '0 4px 30px -4px hsl(25, 95%, 55%, 0.25)',
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
  margin: '0 0 12px',
}

const footerLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap' as const,
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