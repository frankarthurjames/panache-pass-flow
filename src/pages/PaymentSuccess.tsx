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

  const handleDownloadReceipt = async () => {
    if (!orderId) return;
    
    try {
      setDownloadingReceipt(true);
      
      // Générer le PDF du reçu
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-receipt-pdf', {
        body: { orderId: orderId }
      });

      if (pdfError || !pdfData?.pdfUrl) {
        console.error("Error generating receipt PDF:", pdfError);
        toast.error("Erreur lors de la génération du reçu");
        return;
      }

      // Ouvrir le reçu dans un nouvel onglet pour impression
      window.open(pdfData.pdfUrl, '_blank');
      
      toast.success("Reçu téléchargé avec succès !");
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error("Erreur lors du téléchargement du reçu");
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