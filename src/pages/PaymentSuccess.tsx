import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin, Ticket, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

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

        if (orderError) throw orderError;

        setOrderData(order);

        // Vérifier si les inscriptions existent déjà (créées par le webhook)
        if (order.status === 'pending' && sessionId) {
          await finalizeOrder();
        }
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error("Erreur lors du chargement de la commande");
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId, sessionId]);

  const checkOrderStatus = async (orderId: string) => {
    try {
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (!error && updatedOrder?.status === 'paid') {
        // Recharger les données de la commande
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

        if (!orderError && order) {
          setOrderData(order);
          toast.success("Paiement confirmé ! Vos billets vous ont été envoyés par email.");
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error);
    }
  };

  const finalizeOrder = async () => {
    if (!sessionId) return;
    try {
      const { data, error } = await supabase.functions.invoke('finalize-order', {
        body: { sessionId, orderId },
      });

      if (error) throw error as any;

      if (data?.order) {
        setOrderData(data.order);
        toast.success("Paiement confirmé ! Vos billets vous ont été envoyés par email.");
      } else if (orderId) {
        await checkOrderStatus(orderId);
      }
    } catch (err) {
      console.error('Error finalizing order:', err);
      toast.error("Erreur lors de la confirmation du paiement");
    }
  };

  const createRegistrations = async (order: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Créer les inscriptions pour chaque billet
      const registrations = [];
      for (const item of order.order_items) {
        for (let i = 0; i < item.qty; i++) {
          registrations.push({
            event_id: order.event_id,
            ticket_type_id: item.ticket_type_id,
            order_id: order.id,
            user_id: order.user_id,
            status: 'issued'
          });
        }
      }

      const { data: createdRegistrations, error: regError } = await supabase
        .from('registrations')
        .insert(registrations)
        .select();

      if (regError) throw regError;

      // Mettre à jour le statut de la commande
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Créer l'enregistrement de paiement
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          amount_cents: order.total_cents,
          currency: 'EUR',
          provider: 'stripe',
          provider_event: sessionId
        });

      if (paymentError) throw paymentError;

      // Générer et envoyer les tickets par email pour chaque registration
      for (const registration of createdRegistrations) {
        try {
          console.log('Generating ticket for registration:', registration.id);
          
          // Générer le PDF du ticket
          const pdfResponse = await supabase.functions.invoke('generate-ticket-pdf', {
            body: { registrationId: registration.id }
          });

          if (pdfResponse.data?.success && pdfResponse.data?.pdfUrl) {
            console.log('PDF generated, sending email...');
            
            // Envoyer l'email avec le ticket
            const emailResponse = await supabase.functions.invoke('send-ticket-email', {
              body: { 
                registrationId: registration.id,
                pdfUrl: pdfResponse.data.pdfUrl
              }
            });

            if (emailResponse.data?.success) {
              console.log('Ticket email sent for registration:', registration.id);
            } else {
              console.error('Failed to send ticket email:', emailResponse.error);
            }
          } else {
            console.error('Failed to generate PDF:', pdfResponse.error);
          }
        } catch (ticketError) {
          console.error('Error generating/sending ticket for registration', registration.id, ticketError);
          // Continue même si la génération du ticket échoue pour une registration
        }
      }

      toast.success("Inscription confirmée ! Vos billets vous ont été envoyés par email.");
    } catch (error) {
      console.error('Error creating registrations:', error);
      toast.error("Erreur lors de la confirmation de l'inscription");
    }
  };

  const handleDownloadReceipt = () => {
    if (!orderData) return;
    
    try {
      setDownloadingReceipt(true);
      
      // Générer le HTML du reçu côté client
      const event = orderData.events;
      const orderDate = new Date(orderData.created_at);
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
              <div>Commande #${orderData.id.slice(-8).toUpperCase()}</div>
              <div>Date: ${orderDate.toLocaleDateString('fr-FR')}</div>
              <div>Heure: ${orderDate.toLocaleTimeString('fr-FR')}</div>
              <div>
                <span class="status-badge status-paid">Payé</span>
              </div>
            </div>
            <div class="info-section">
              <div class="info-title">Client</div>
              <div>${orderData.user_id || 'Client'}</div>
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
              ${orderData.order_items.map((item: any) => `
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
              <span>Sous-total HT:</span>
              <span>${((orderData.subtotal_cents || orderData.total_cents) / 100).toFixed(2)}€</span>
            </div>
            ${orderData.platform_fee_cents ? `
              <div class="total-line">
                <span>Frais de plateforme HT (2% + 0,50€/billet):</span>
                <span>${(orderData.platform_fee_cents / 100).toFixed(2)}€</span>
              </div>
            ` : ''}
            <div class="total-line">
              <span>Total HT:</span>
              <span>${(((orderData.subtotal_cents || orderData.total_cents) + (orderData.platform_fee_cents || 0)) / 100).toFixed(2)}€</span>
            </div>
            <div class="total-line">
              <span>TVA (20%):</span>
              <span>${((((orderData.subtotal_cents || orderData.total_cents) + (orderData.platform_fee_cents || 0)) * 0.20) / 100).toFixed(2)}€</span>
            </div>
            <div class="total-line total-final">
              <span>Total TTC:</span>
              <span>${(orderData.total_cents / 100).toFixed(2)}€</span>
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
    } finally {
      setDownloadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Confirmation de votre paiement...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Commande introuvable</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Impossible de trouver les détails de votre commande.
            </p>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const event = orderData.events;
  const totalTickets = orderData.order_items.reduce((sum: number, item: any) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Paiement réussi !</CardTitle>
            <p className="text-muted-foreground">
              Votre inscription a été confirmée avec succès
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Détails de l'événement */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Détails de l'événement</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-lg">{event.title}</h4>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.starts_at).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venue}, {event.city}</span>
                </div>
              </div>
            </div>

            {/* Détails des billets */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vos billets</h3>
              <div className="space-y-2">
                {orderData.order_items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span>{item.ticket_types.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">x{item.qty}</div>
                      <div className="text-sm text-muted-foreground">
                        {(item.unit_price_cents / 100).toFixed(2)}€ chacun
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total payé</span>
                <span>{(orderData.total_cents / 100).toFixed(2)}€</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalTickets} billet{totalTickets > 1 ? 's' : ''}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link to={`/events/${event.id}`}>
                  Voir l'événement
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDownloadReceipt}
                disabled={downloadingReceipt}
              >
                <Download className="w-4 h-4 mr-2" />
                {downloadingReceipt ? 'Génération...' : 'Télécharger le reçu'}
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Vos billets PDF vous ont été envoyés par email. Vérifiez votre boîte de réception.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Conservez bien vos billets et présentez-les à l'entrée de l'événement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;