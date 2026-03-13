import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, CreditCard, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
  registrations: any[];
}

const EventCheckout = ({ eventId, eventTitle, eventDate, ticketTypes, registrations }: EventCheckoutProps) => {
  const { user } = useAuth();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeStatusLoading, setIsStripeStatusLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; charges_enabled: boolean }>({
    connected: false,
    charges_enabled: false
  });

  // Vérifier le statut Stripe de l'organisation
  useEffect(() => {
    const checkStripeStatus = async () => {
      setIsStripeStatusLoading(true);
      try {
        // Récupérer l'organisation de l'événement
        const { data: eventData, error } = await supabase
          .from('events')
          .select('organization_id, organizations(stripe_account_id)')
          .eq('id', eventId)
          .single();

        if (error || !eventData) {
          setIsStripeStatusLoading(false);
          return;
        }

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
      } finally {
        setIsStripeStatusLoading(false);
      }
    };

    checkStripeStatus();
  }, [eventId]);

  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) return;

    // Calculer les billets réellement disponibles (en tenant compte des ventes)
    const soldCount = registrations.filter(r => r.ticket_type_id === ticketId).length;
    const availableCount = Math.max(0, ticketType.quantity - soldCount);

    const maxAllowed = Math.min(availableCount, ticketType.max_per_order);
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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session expirée, veuillez vous reconnecter");
      }

      const { data: result, error: invokeError } = await supabase.functions.invoke('create-payment-session', {
        body: {
          eventId,
          lineItems: selectedTicketTypes.map(ticket => ({
            ticket_type_id: ticket.id,
            quantity: ticket.quantity,
            unit_price_cents: ticket.price_cents
          }))
        }
      });

      if (invokeError) {
        // Gérer spécifiquement les erreurs remontées par l'edge function
        const errorMessage = invokeError.message || invokeError.error || 'Erreur lors de la création de la session de paiement';
        throw new Error(errorMessage);
      }

      const data = result;

      // Rediriger vers Stripe Checkout si payant
      if (data?.url) {
        window.location.href = data.url;
      }
      // Rediriger directement vers la page succès si gratuit
      else if (data?.success && data?.orderId) {
        window.location.href = `${window.location.origin}/payment-success?order_id=${data.orderId}`;
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors du traitement du paiement");
    } finally {
      setIsLoading(false);
    }
  };

  const isCheckoutDisabled = getTotalTickets() === 0 || isLoading || !stripeStatus.charges_enabled;

  if (isStripeStatusLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Chargement des options de paiement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left: Summary and Info */}
      <div className="lg:w-2/5 p-8 bg-black text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Paiement sécurisé</span>
          </div>

          <h2 className="text-3xl font-extrabold mb-4 leading-tight">{eventTitle}</h2>
          <div className="space-y-4 text-gray-400">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{eventDate}</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Billet électronique immédiat</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Accès garanti à l'événement</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-gray-500 leading-relaxed">
            En procédant au paiement, vous acceptez les conditions générales de vente de Panache et de l'organisateur.
          </p>
        </div>
      </div>

      {/* Right: Ticket Selection */}
      <div className="lg:w-3/5 p-8 bg-white overflow-y-auto">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-black mb-2">Choisir vos billets</h3>
          <p className="text-gray-500 text-sm">Sélectionnez le nombre de places que vous souhaitez réserver.</p>
        </div>

        <div className="space-y-4 mb-8">
          {ticketTypes.map((ticketType) => {
            const selectedQty = selectedTickets[ticketType.id] || 0;
            const soldCount = registrations.filter(r => r.ticket_type_id === ticketType.id).length;
            const availableCount = Math.max(0, ticketType.quantity - soldCount);
            const isSoldOut = availableCount === 0;

            return (
              <div
                key={ticketType.id}
                className={`p-4 rounded-2xl border-2 transition-all ${selectedQty > 0
                  ? 'border-orange-500 bg-orange-50/30'
                  : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{ticketType.name}</span>
                      {isSoldOut && (
                        <Badge variant="destructive" className="bg-red-500">Épuisé</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-orange-600">
                        {ticketType.price_cents === 0 ? "Gratuit" : `${(ticketType.price_cents / 100).toFixed(2)}€`}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        {availableCount} restant{availableCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {!isSoldOut && stripeStatus.charges_enabled && (
                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateTicketQuantity(ticketType.id, selectedQty - 1)}
                        disabled={selectedQty === 0}
                        className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-6 text-center font-bold text-gray-900">{selectedQty}</span>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateTicketQuantity(ticketType.id, selectedQty + 1)}
                        disabled={selectedQty >= Math.min(availableCount, ticketType.max_per_order)}
                        className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Messages */}
        {!stripeStatus.connected && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Paiements indisponibles</p>
              <p className="text-xs text-red-600">L'organisateur n'a pas encore configuré Stripe pour cet événement.</p>
            </div>
          </div>
        )}

        {stripeStatus.connected && !stripeStatus.charges_enabled && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-800">Configuration requise</p>
              <p className="text-xs text-orange-600">La configuration du compte Stripe est incomplète.</p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total à payer</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-black">{(getTotalPrice() / 100).toFixed(2)}</span>
                <span className="text-xl font-bold text-black font-sans">€</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">{getTotalTickets()} billets</span>
              <p className="text-[10px] text-gray-400 font-medium">TVA incluse</p>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isCheckoutDisabled}
            className={`w-full h-16 rounded-2xl text-lg font-black transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] ${isCheckoutDisabled
              ? 'bg-gray-100 text-gray-400'
              : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <CreditCard className="mr-3 h-6 w-6" />
            )}
            {isLoading ? "Traitement..." :
              getTotalTickets() === 0 ? "Sélectionner des billets" :
                getTotalPrice() === 0 ? "Confirmer la réservation" :
                  !stripeStatus.charges_enabled ? "Paiements non disponibles" :
                    "Confirmer la commande"}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCheckout;