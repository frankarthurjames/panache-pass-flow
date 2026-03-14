import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// Local Subcomponents
import { EventTicketList } from "@/components/dashboard/my-events/EventTicketList";
import { OrderTicketItem } from "@/components/dashboard/my-events/OrderTicketItem";

const MyEvents = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [isDownloadingTickets, setIsDownloadingTickets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select(`
            id,
            first_name,
            last_name,
            status,
            qr_code,
            qr_scanned,
            created_at,
            ticket_type:ticket_types(id, name, price_cents),
            event:events(id, title, starts_at, venue, city, status, images),
            order:orders(id, status, amount_cents)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Grouping logic unchanged...
        const validRegistrations = data?.filter(r => r.order?.status === 'paid') || [];
        const groupedByEvent = validRegistrations.reduce((acc: any, curr: any) => {
          const eventId = curr.event.id;
          if (!acc[eventId]) {
            acc[eventId] = { event: curr.event, orders: {} };
          }
          const orderId = curr.order.id;
          if (!acc[eventId].orders[orderId]) {
            acc[eventId].orders[orderId] = {
              id: orderId,
              status: curr.order.status,
              amount: curr.order.amount_cents,
              totalPaid: curr.order.amount_cents / 100,
              registrations: []
            };
          }
          acc[eventId].orders[orderId].registrations.push(curr);
          return acc;
        }, {});

        const formattedData = Object.values(groupedByEvent).map((group: any) => ({
          event: group.event,
          orders: Object.values(group.orders).sort((a: any, b: any) => {
            const dateA = Math.max(...a.registrations.map((r: any) => new Date(r.created_at).getTime()));
            const dateB = Math.max(...b.registrations.map((r: any) => new Date(r.created_at).getTime()));
            return dateB - dateA;
          })
        })).sort((a: any, b: any) => new Date(b.event.starts_at).getTime() - new Date(a.event.starts_at).getTime());

        setRegistrations(formattedData);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [user]);

  const handleDownloadTicket = async (registrationId: string) => {
    setIsDownloadingTickets(prev => ({ ...prev, [registrationId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('generate-ticket', {
        body: { registrationId }
      });
      if (error) throw error;
      
      const pdfBytes = Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0));
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `billet-${registrationId.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Billet téléchargé avec succès");
    } catch (error) {
      console.error('Error generating ticket:', error);
      toast.error("Erreur lors de la génération du billet");
    } finally {
      setIsDownloadingTickets(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { orderId }
      });
      if (error) throw error;
      
      const pdfBytes = Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0));
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recu-${orderId.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Reçu téléchargé avec succès");
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error("Erreur lors du téléchargement du reçu");
    }
  };

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getEventStatus = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.starts_at);
    if (event.status === 'cancelled') return { label: 'Annulé', color: 'bg-red-500 text-white' };
    if (eventDate >= now) return { label: 'À venir', color: 'bg-orange-500 text-white' };
    return { label: 'Terminé', color: 'bg-gray-500 text-white' };
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-500 font-medium">Chargement de vos événements...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const now = new Date();
  const filteredRegistrations = registrations.filter((group: any) => 
    group.event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const upcomingEvents = filteredRegistrations.filter((g: any) => new Date(g.event.starts_at) >= now);
  const pastEvents = filteredRegistrations.filter((g: any) => new Date(g.event.starts_at) < now);

  return (
    <PageContainer>
      <PageHeader 
        title="Mes événements" 
        description="Gérez vos réservations et téléchargez vos billets."
        action={
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white shadow-md font-bold rounded-xl h-10 px-5">
              <Link to="/dashboard/events/new">
                
                Créer un événement
              </Link>
            </Button>
          </div>
        }
      />
      <div className="space-y-6 mt-6">
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-xl h-auto">
            <TabsTrigger value="upcoming" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-semibold transition-all">
              À venir ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-semibold transition-all">
              Passés ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-0">
            <EventTicketList 
              events={upcomingEvents} 
              expandedEvents={expandedEvents} 
              toggleEventDetails={toggleEventDetails}
              getEventStatus={getEventStatus}
              formatDate={formatDate}
              type="upcoming"
              renderOrderDetails={(order: any, idx: number) => (
                <OrderTicketItem 
                  key={order.id} 
                  order={order} 
                  handleDownloadTicket={handleDownloadTicket} 
                  handleDownloadInvoice={handleDownloadInvoice}
                  isDownloadingTickets={isDownloadingTickets} 
                />
              )}
            />
          </TabsContent>
          <TabsContent value="past" className="mt-0">
            <EventTicketList 
              events={pastEvents} 
              expandedEvents={expandedEvents} 
              toggleEventDetails={toggleEventDetails}
              getEventStatus={getEventStatus}
              formatDate={formatDate}
              type="past"
              renderOrderDetails={(order: any, idx: number) => (
                <OrderTicketItem 
                  key={order.id} 
                  order={order} 
                  handleDownloadTicket={handleDownloadTicket} 
                  handleDownloadInvoice={handleDownloadInvoice}
                  isDownloadingTickets={isDownloadingTickets} 
                />
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default MyEvents;
