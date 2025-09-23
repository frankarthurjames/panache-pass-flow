import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Download, Ticket, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const MyEvents = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingTickets, setDownloadingTickets] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Récupérer les inscriptions de l'utilisateur avec les détails de l'événement
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('registrations')
          .select(`
            *,
            events (
              id,
              title,
              starts_at,
              ends_at,
              venue,
              city,
              status,
              capacity,
              organizations (
                name,
                logo_url
              )
            ),
            ticket_types (
              name,
              price_cents
            ),
            orders (
              id,
              total_cents,
              status,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .eq('orders.status', 'paid')
          .order('created_at', { ascending: false });

        if (registrationsError) {
          console.error('Error fetching registrations:', registrationsError);
          toast.error("Erreur lors du chargement de vos événements");
          return;
        }

        // Grouper les inscriptions par événement
        const groupedRegistrations = registrationsData?.reduce((acc: any, reg: any) => {
          const eventId = reg.events.id;
          if (!acc[eventId]) {
            acc[eventId] = {
              event: reg.events,
              registrations: [],
              totalPaid: 0
            };
          }
          acc[eventId].registrations.push(reg);
          acc[eventId].totalPaid += reg.orders?.total_cents || 0;
          return acc;
        }, {}) || {};

        setRegistrations(Object.values(groupedRegistrations));
      } catch (error) {
        console.error('Error:', error);
        toast.error("Erreur lors du chargement de vos événements");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  const handleDownloadTicket = async (registrationId: string) => {
    try {
      setDownloadingTickets(prev => ({ ...prev, [registrationId]: true }));
      
      // Générer le PDF du billet
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-ticket-pdf', {
        body: { registrationId: registrationId }
      });

      if (pdfError || !pdfData?.pdfUrl) {
        console.error("Error generating ticket PDF:", pdfError);
        toast.error("Erreur lors de la génération du billet");
        return;
      }

      // Télécharger le PDF
      const response = await fetch(pdfData.pdfUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `billet-${registrationId.slice(-8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Billet téléchargé avec succès !");
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error("Erreur lors du téléchargement du billet");
    } finally {
      setDownloadingTickets(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  const handleDownloadReceipt = async (orderId: string) => {
    try {
      // Récupérer les détails de la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          events (
            id,
            title,
            starts_at,
            venue,
            city
          ),
          order_items (
            qty,
            unit_price_cents,
            ticket_types (
              name
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        toast.error("Erreur lors du chargement de la commande");
        return;
      }

      // Générer le HTML du reçu côté client (même logique que PaymentSuccess)
      const event = order.events;
      const orderDate = new Date(order.created_at);
      const eventDate = new Date(event.starts_at);
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reçu - ${event.title}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .receipt-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .info-section {
              flex: 1;
              min-width: 200px;
              margin: 10px;
            }
            .info-title {
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 5px;
            }
            .event-details {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .event-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .event-info {
              display: flex;
              gap: 20px;
              flex-wrap: wrap;
            }
            .event-info div {
              flex: 1;
              min-width: 150px;
            }
            .tickets-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .tickets-table th,
            .tickets-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            .tickets-table th {
              background: #f8fafc;
              font-weight: bold;
              color: #3b82f6;
            }
            .tickets-table .text-right {
              text-align: right;
            }
            .total-section {
              border-top: 2px solid #3b82f6;
              padding-top: 20px;
              margin-top: 20px;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total-final {
              font-size: 18px;
              font-weight: bold;
              color: #3b82f6;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 12px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-paid {
              background: #dcfce7;
              color: #166534;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Panache</div>
            <div class="receipt-title">Reçu de paiement</div>
          </div>

          <div class="receipt-info">
            <div class="info-section">
              <div class="info-title">Informations de commande</div>
              <div>Commande #${order.id.slice(-8).toUpperCase()}</div>
              <div>Date: ${orderDate.toLocaleDateString('fr-FR')}</div>
              <div>Heure: ${orderDate.toLocaleTimeString('fr-FR')}</div>
              <div>
                <span class="status-badge status-paid">Payé</span>
              </div>
            </div>
          </div>

          <div class="event-details">
            <div class="event-title">${event.title}</div>
            <div class="event-info">
              <div>
                <strong>Date:</strong><br>
                ${eventDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div>
                <strong>Heure:</strong><br>
                ${eventDate.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div>
                <strong>Lieu:</strong><br>
                ${event.venue || 'À confirmer'}<br>
                ${event.city}
              </div>
            </div>
          </div>

          <table class="tickets-table">
            <thead>
              <tr>
                <th>Type de billet</th>
                <th class="text-right">Quantité</th>
                <th class="text-right">Prix unitaire</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map((item: any) => `
                <tr>
                  <td>${item.ticket_types.name}</td>
                  <td class="text-right">${item.qty}</td>
                  <td class="text-right">${(item.unit_price_cents / 100).toFixed(2)}€</td>
                  <td class="text-right">${((item.unit_price_cents * item.qty) / 100).toFixed(2)}€</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-line">
              <span>Sous-total:</span>
              <span>${((order.subtotal_cents || order.total_cents) / 100).toFixed(2)}€</span>
            </div>
            ${order.platform_fee_cents ? `
              <div class="total-line">
                <span>Frais de plateforme (2% + 0,50€/billet):</span>
                <span>${(order.platform_fee_cents / 100).toFixed(2)}€</span>
              </div>
            ` : ''}
            <div class="total-line total-final">
              <span>Total payé:</span>
              <span>${(order.total_cents / 100).toFixed(2)}€</span>
            </div>
          </div>

          <div class="footer">
            <p>Merci d'avoir choisi Panache pour vos événements sportifs !</p>
            <p>Ce reçu confirme votre inscription à l'événement. Conservez-le précieusement.</p>
            <p>Pour toute question, contactez l'organisateur ou notre support client.</p>
          </div>
        </body>
        </html>
      `;

      // Créer une nouvelle fenêtre avec le reçu
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Attendre que le contenu soit chargé puis imprimer
        printWindow.onload = () => {
          printWindow.print();
        };
        
        toast.success("Reçu généré ! Utilisez Ctrl+P pour imprimer.");
      } else {
        toast.error("Impossible d'ouvrir la fenêtre d'impression");
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error("Erreur lors de la génération du reçu");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event: any) => {
    const now = new Date();
    const startDate = new Date(event.starts_at);
    const endDate = new Date(event.ends_at);

    if (now < startDate) {
      return { status: 'upcoming', label: 'À venir', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'ongoing', label: 'En cours', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'past', label: 'Terminé', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement de vos événements...</p>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">Aucun événement trouvé</h2>
        <p className="text-muted-foreground mb-6">
          Vous n'avez pas encore d'événements réservés.
        </p>
        <Button asChild>
          <Link to="/events">Découvrir les événements</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes événements</h1>
        <p className="text-muted-foreground">
          Gérez vos réservations et téléchargez vos billets
        </p>
      </div>

      <div className="grid gap-6">
        {registrations.map((group: any, index: number) => {
          const event = group.event;
          const eventStatus = getEventStatus(event);
          const uniqueOrderId = group.registrations[0]?.orders?.id;

          return (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge className={eventStatus.color}>
                        {eventStatus.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.starts_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue}, {event.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{group.registrations.length} billet{group.registrations.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {(group.totalPaid / 100).toFixed(2)}€
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total payé
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Détails des billets */}
                  <div>
                    <h4 className="font-medium mb-2">Vos billets</h4>
                    <div className="space-y-2">
                      {group.registrations.map((reg: any, regIndex: number) => (
                        <div key={regIndex} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-primary" />
                            <span>{reg.ticket_types.name}</span>
                            <span className="text-sm text-muted-foreground">
                              - {(reg.ticket_types.price_cents / 100).toFixed(2)}€
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTicket(reg.id)}
                            disabled={downloadingTickets[reg.id]}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {downloadingTickets[reg.id] ? 'Génération...' : 'Télécharger'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button asChild variant="outline">
                      <Link to={`/events/${event.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir l'événement
                      </Link>
                    </Button>
                    {uniqueOrderId && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadReceipt(uniqueOrderId)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger le reçu
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MyEvents;
