import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TicketType {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  max_per_order: number;
  currency: string;
}

interface EventCheckoutProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  ticketTypes: TicketType[];
}

const EventCheckout = ({ eventId, eventTitle, eventDate, ticketTypes }: EventCheckoutProps) => {
  const { user } = useAuth();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; charges_enabled: boolean }>({ 
    connected: false, 
    charges_enabled: false 
  });

  // Vérifier le statut Stripe de l'organisation
  useEffect(() => {
    const checkStripeStatus = async () => {
      try {
        // Récupérer l'organisation de l'événement
        const { data: eventData, error } = await supabase
          .from('events')
          .select('organization_id, organizations(stripe_account_id)')
          .eq('id', eventId)
          .single();

        if (error || !eventData) return;

        if (eventData.organizations?.stripe_account_id) {
          // Vérifier le statut du compte Stripe
          const { data: statusData, error: statusError } = await supabase.functions.invoke('check-connect-status', {
            body: { organizationId: eventData.organization_id }
          });

          if (!statusError && statusData) {
            setStripeStatus({
              connected: statusData.connected,
              charges_enabled: statusData.charges_enabled
            });
          }
        }
      } catch (error) {
        console.error('Error checking Stripe status:', error);
      }
    };

    checkStripeStatus();
  }, [eventId]);

  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) return;

    const maxAllowed = Math.min(ticketType.quantity, ticketType.max_per_order);
    const newQuantity = Math.max(0, Math.min(quantity, maxAllowed));
    
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: newQuantity
    }));
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticketType = ticketTypes.find(t => t.id === ticketId);
      return total + (ticketType ? ticketType.price_cents * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour acheter des billets");
      return;
    }

    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      toast.error("Veuillez sélectionner au moins un billet");
      return;
    }

    if (!stripeStatus.charges_enabled) {
      toast.error("Les paiements ne sont pas encore activés pour cet événement");
      return;
    }

    setIsLoading(true);
    try {
      // Préparer les données des billets sélectionnés
      const selectedTicketTypes = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketId, quantity]) => {
          const ticketType = ticketTypes.find(t => t.id === ticketId);
          return {
            id: ticketId,
            name: ticketType?.name,
            price_cents: ticketType?.price_cents,
            quantity
          };
        });

      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          eventId,
          ticketTypes: selectedTicketTypes
        }
      });

      if (error) throw error;

      // Rediriger vers Stripe Checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast.error("Erreur lors du traitement du paiement");
    } finally {
      setIsLoading(false);
    }
  };

  const isCheckoutDisabled = getTotalTickets() === 0 || isLoading || !stripeStatus.charges_enabled;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Réservation</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">{eventTitle}</p>
          <p>{eventDate}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!stripeStatus.connected && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Les paiements ne sont pas encore configurés pour cet événement.
            </p>
          </div>
        )}

        {stripeStatus.connected && !stripeStatus.charges_enabled && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Configuration des paiements en cours. Les billets seront bientôt disponibles.
            </p>
          </div>
        )}

        {/* Types de billets */}
        <div className="space-y-3">
          {ticketTypes.map((ticketType) => {
            const selectedQty = selectedTickets[ticketType.id] || 0;
            const isAvailable = ticketType.quantity > 0;
            
            return (
              <div key={ticketType.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ticketType.name}</span>
                      {!isAvailable && (
                        <Badge variant="secondary">Épuisé</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ticketType.price_cents === 0 ? (
                        "Gratuit"
                      ) : (
                        `${(ticketType.price_cents / 100).toFixed(2)}€`
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ticketType.quantity} disponible{ticketType.quantity > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {isAvailable && stripeStatus.charges_enabled && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketQuantity(ticketType.id, selectedQty - 1)}
                        disabled={selectedQty === 0}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={selectedQty}
                        onChange={(e) => updateTicketQuantity(ticketType.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center"
                        min="0"
                        max={Math.min(ticketType.quantity, ticketType.max_per_order)}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketQuantity(ticketType.id, selectedQty + 1)}
                        disabled={selectedQty >= Math.min(ticketType.quantity, ticketType.max_per_order)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {getTotalTickets() > 0 && (
          <>
            <Separator />
            
            {/* Résumé */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nombre de billets</span>
                <span>{getTotalTickets()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{(getTotalPrice() / 100).toFixed(2)}€</span>
              </div>
            </div>
          </>
        )}

        {/* Bouton de paiement */}
        <Button 
          onClick={handleCheckout}
          disabled={isCheckoutDisabled}
          className="w-full"
          size="lg"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <CreditCard className="mr-2 h-4 w-4" />
          {isLoading ? "Traitement..." : 
           getTotalTickets() === 0 ? "Sélectionner des billets" :
           !stripeStatus.charges_enabled ? "Paiements non disponibles" :
           "Procéder au paiement"}
        </Button>

        {stripeStatus.charges_enabled && (
          <p className="text-xs text-muted-foreground text-center">
            Paiement sécurisé par Stripe
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCheckout;