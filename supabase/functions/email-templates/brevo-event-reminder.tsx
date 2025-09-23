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
} from 'npm:@react-email/components@0.0.22'
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
}: EventReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Rappel : {eventTitle} c'est demain !</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <div style={logoContainer}>
            <img src="https://wlxbydzshqijlfejqafp.supabase.co/storage/v1/object/public/event-images/panache-logo-text.png" alt="Panache" style={logoImage} />
          </div>
        </Section>

        {/* Reminder badge */}
        <Section style={content}>
          <div style={reminderBadge}>
            <span style={reminderIcon}>⏰</span>
            <Text style={reminderText}>C'est bientôt !</Text>
          </div>

          <Heading style={h1}>Bonjour {userName},</Heading>
          
          <Text style={text}>
            Nous espérons que vous êtes aussi excité que nous ! 
            Votre événement <strong>{eventTitle}</strong> a lieu <strong>demain</strong>.
          </Text>

          {/* Event reminder card */}
          <div style={eventCard}>
            <div style={eventHeader}>
              <Heading style={eventTitle}>{eventTitle}</Heading>
              <Text style={eventOrganizer}>Organisé par {organizerName}</Text>
            </div>
            
            <div style={eventDetails}>
              <div style={eventDetail}>
                <span style={eventIcon}>📅</span>
                <div style={eventInfo}>
                  <Text style={eventLabel}>Date</Text>
                  <Text style={eventValue}>{eventDate}</Text>
                </div>
              </div>
              
              <div style={eventDetail}>
                <span style={eventIcon}>🕐</span>
                <div style={eventInfo}>
                  <Text style={eventLabel}>Heure</Text>
                  <Text style={eventValue}>{eventTime}</Text>
                </div>
              </div>
              
              <div style={eventDetail}>
                <span style={eventIcon}>📍</span>
                <div style={eventInfo}>
                  <Text style={eventLabel}>Lieu</Text>
                  <Text style={eventValue}>{eventVenue}, {eventCity}</Text>
                </div>
              </div>
              
              <div style={eventDetail}>
                <span style={eventIcon}>🎫</span>
                <div style={eventInfo}>
                  <Text style={eventLabel}>Vos billets</Text>
                  <Text style={eventValue}>
                    {ticketsCount} billet{ticketsCount > 1 ? 's' : ''}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Important reminders */}
          <Section style={remindersSection}>
            <Heading style={sectionTitle}>N'oubliez pas :</Heading>
            
            <div style={reminderItem}>
              <span style={checkIcon}>✅</span>
              <Text style={reminderItemText}>
                Arrivez 15 minutes avant le début pour éviter les files d'attente
              </Text>
            </div>
            
            <div style={reminderItem}>
              <span style={checkIcon}>✅</span>
              <Text style={reminderItemText}>
                Apportez votre billet (version numérique ou imprimée)
              </Text>
            </div>
            
            <div style={reminderItem}>
              <span style={checkIcon}>✅</span>
              <Text style={reminderItemText}>
                Portez une tenue de sport adaptée à l'activité
              </Text>
            </div>
            
            <div style={reminderItem}>
              <span style={checkIcon}>✅</span>
              <Text style={reminderItemText}>
                N'oubliez pas votre bouteille d'eau et une serviette
              </Text>
            </div>
          </Section>

          {/* Special instructions */}
          {specialInstructions && (
            <Section style={instructionsSection}>
              <Heading style={instructionsTitle}>Instructions spéciales</Heading>
              <div style={instructionsCard}>
                <Text style={instructionsText}>{specialInstructions}</Text>
              </div>
            </Section>
          )}

          {/* Weather reminder */}
          <Section style={weatherSection}>
            <div style={weatherCard}>
              <span style={weatherIcon}>🌤️</span>
              <div>
                <Text style={weatherTitle}>Pensez à vérifier la météo</Text>
                <Text style={weatherText}>
                  Consultez les prévisions météo pour vous habiller en conséquence
                </Text>
              </div>
            </div>
          </Section>

          {/* Action buttons */}
          <Section style={buttonsSection}>
            <Link href="#" style={primaryButton}>
              Voir mes billets
            </Link>
            
            <Link href="#" style={secondaryButton}>
              Itinéraire vers le lieu
            </Link>
          </Section>

          <Text style={contactText}>
            Une question de dernière minute ? Contactez l'organisateur 
            <Link href="#" style={link}> {organizerName}</Link> ou notre 
            <Link href="#" style={link}> équipe support</Link>.
          </Text>

          <div style={excitementSection}>
            <Text style={excitementText}>
              🎉 Nous avons hâte de vous voir demain ! 🎉
            </Text>
          </div>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Email de rappel envoyé par Panache pour {eventTitle}
          </Text>
          <div style={footerLinks}>
            <Link href="#" style={footerLink}>Mes événements</Link>
            <span style={separator}>•</span>
            <Link href="#" style={footerLink}>Support</Link>
            <span style={separator}>•</span>
            <Link href="#" style={footerLink}>Annulation</Link>
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EventReminderEmail

// Styles with Panache design system
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
}

const logoImage = {
  height: '40px',
  width: 'auto',
}

const content = {
  padding: '32px 24px',
}

const reminderBadge = {
  backgroundColor: 'hsl(38, 92%, 95%)',
  border: '2px solid hsl(38, 92%, 80%)',
  borderRadius: '12px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}

const reminderIcon = {
  fontSize: '24px',
}

const reminderText = {
  color: 'hsl(38, 92%, 50%)',
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

const eventHeader = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const eventTitle = {
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  color: '#ffffff',
}

const eventOrganizer = {
  fontSize: '14px',
  margin: 0,
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: '500',
}

const eventDetails = {
  display: 'grid',
  gap: '16px',
}

const eventDetail = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '12px',
}

const eventIcon = {
  fontSize: '20px',
  width: '24px',
  textAlign: 'center' as const,
}

const eventInfo = {
  flex: 1,
}

const eventLabel = {
  fontSize: '12px',
  margin: '0 0 2px',
  color: 'rgba(255, 255, 255, 0.8)',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const eventValue = {
  fontSize: '16px',
  margin: 0,
  color: '#ffffff',
  fontWeight: 'bold',
}

const remindersSection = {
  margin: '32px 0',
}

const sectionTitle = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 20px',
}

const reminderItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: 'hsl(142, 76%, 98%)',
  borderRadius: '8px',
  border: '1px solid hsl(142, 76%, 90%)',
}

const checkIcon = {
  fontSize: '16px',
  marginTop: '2px',
}

const reminderItemText = {
  color: 'hsl(142, 76%, 36%)',
  fontSize: '14px',
  margin: 0,
  lineHeight: '20px',
  fontWeight: '500',
}

const instructionsSection = {
  margin: '32px 0',
}

const instructionsTitle = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const instructionsCard = {
  backgroundColor: 'hsl(38, 92%, 98%)',
  border: '2px solid hsl(38, 92%, 85%)',
  borderRadius: '12px',
  padding: '20px',
}

const instructionsText = {
  color: 'hsl(38, 92%, 35%)',
  fontSize: '14px',
  margin: 0,
  lineHeight: '20px',
  fontWeight: '500',
}

const weatherSection = {
  margin: '32px 0',
}

const weatherCard = {
  backgroundColor: 'hsl(220, 14%, 96%)',
  border: '1px solid hsl(220, 13%, 91%)',
  borderRadius: '12px',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}

const weatherIcon = {
  fontSize: '24px',
}

const weatherTitle = {
  color: 'hsl(224, 71%, 4%)',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px',
}

const weatherText = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '13px',
  margin: 0,
  lineHeight: '18px',
}

const buttonsSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
  display: 'flex',
  gap: '12px',
  flexDirection: 'column' as const,
}

const primaryButton = {
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
  margin: '0 0 8px',
}

const secondaryButton = {
  backgroundColor: 'transparent',
  border: '2px solid hsl(25, 95%, 55%)',
  borderRadius: '8px',
  color: 'hsl(25, 95%, 55%)',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const contactText = {
  color: 'hsl(220, 9%, 46%)',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const excitementSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
  padding: '20px',
  backgroundColor: 'hsl(25, 95%, 98%)',
  borderRadius: '12px',
  border: '2px solid hsl(25, 95%, 90%)',
}

const excitementText = {
  color: 'hsl(25, 95%, 45%)',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: 0,
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