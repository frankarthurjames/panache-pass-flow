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
    <Preview>Votre billet pour {eventTitle} est prêt !</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header simple avec logo */}
        <Section style={header}>
          <img src="https://wlxbydzshqijlfejqafp.supabase.co/storage/v1/object/public/event-images/panache-logo-text.png" alt="Panache" style={logoImage} />
        </Section>

        {/* Contenu principal */}
        <Section style={content}>
          <Heading style={h1}>Bonjour {userName},</Heading>
          
          <Text style={text}>
            Votre inscription à <strong>{eventTitle}</strong> a été confirmée avec succès.
          </Text>

          {/* Résumé simple */}
          <div style={summaryCard}>
            <Text style={summaryTitle}>{eventTitle}</Text>
            <Text style={summaryDate}>{eventDate}</Text>
            <Text style={summaryLocation}>{eventVenue}, {eventCity}</Text>
          </div>

          {/* Détails essentiels */}
          <div style={detailsSection}>
            <Text style={detailsTitle}>Détails de votre réservation</Text>
            
            {ticketTypes.map((ticket, index) => (
              <div key={index} style={ticketRow}>
                <Text style={ticketName}>{ticket.name} x{ticket.quantity}</Text>
                <Text style={ticketPrice}>
                  {ticket.price > 0 ? `${(ticket.price / 100).toFixed(2)} €` : 'Gratuit'}
                </Text>
              </div>
            ))}
            
            <div style={totalRow}>
              <Text style={totalLabel}>Total</Text>
              <Text style={totalAmount}>
                {totalAmount > 0 ? `${(totalAmount / 100).toFixed(2)} €` : 'Gratuit'}
              </Text>
            </div>
          </div>

          {/* QR Code si disponible */}
          {qrCodeUrl && (
            <div style={qrSection}>
              <Text style={qrTitle}>Votre billet</Text>
              <div style={qrContainer}>
                <img src={qrCodeUrl} alt="QR Code" style={qrCode} />
              </div>
              <Text style={qrText}>Présentez ce QR code à l'entrée</Text>
            </div>
          )}

          {/* Message important simple */}
          <div style={importantBox}>
            <Text style={importantText}>
              <strong>Important :</strong> Arrivez 15 minutes avant le début. 
              Conservez cet email comme preuve d'achat.
            </Text>
          </div>

          <Text style={helpText}>
            Des questions ? Contactez l'organisateur.
          </Text>
        </Section>

        {/* Footer simple */}
        <Section style={footer}>
          <Text style={footerText}>
            Panache - Plateforme de billetterie sportive
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EventConfirmationEmail

// Styles simplifiés et naturels
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px 24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e5e7eb',
}

const logoImage = {
  height: '32px',
  width: 'auto',
}

const content = {
  padding: '32px 24px',
}

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const summaryCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const summaryTitle = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const summaryDate = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 4px',
}

const summaryLocation = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
}

const detailsSection = {
  margin: '24px 0',
}

const detailsTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const ticketRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #f3f4f6',
}

const ticketName = {
  color: '#111827',
  fontSize: '14px',
  margin: '0',
}

const ticketPrice = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0 0',
  borderTop: '1px solid #d1d5db',
  marginTop: '8px',
}

const totalLabel = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const totalAmount = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const qrSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const qrTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const qrContainer = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  display: 'inline-block',
  margin: '0 0 8px',
}

const qrCode = {
  width: '120px',
  height: '120px',
}

const qrText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
}

const importantBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  padding: '12px',
  margin: '24px 0',
}

const importantText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
  lineHeight: '20px',
}

const helpText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const footer = {
  padding: '24px',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
}