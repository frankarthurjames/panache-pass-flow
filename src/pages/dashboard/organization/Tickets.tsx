import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Search, Download, User, Calendar, MapPin, Ticket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const Tickets = () => {
  const { orgId } = useParams();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingTickets, setDownloadingTickets] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchTickets = async () => {
      if (!orgId) return;

      try {
        setLoading(true);

        // Récupérer tous les billets pour les événements de cette organisation
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('registrations')
          .select(`
            *,
            events (
              id,
              title,
              starts_at,
              venue,
              city,
              status
            ),
            ticket_types (
              name,
              price_cents
            ),
            users (
              display_name,
              email
            ),
            orders (
              id,
              status,
              total_cents,
              created_at
            )
          `)
          .eq('events.organization_id', orgId)
          .eq('orders.status', 'paid')
          .order('created_at', { ascending: false });

        if (ticketsError) {
          console.error('Error fetching tickets:', ticketsError);
          toast.error("Erreur lors du chargement des billets");
          return;
        }

        setTickets(ticketsData || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Erreur lors du chargement des billets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [orgId]);

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

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.events?.title?.toLowerCase().includes(searchLower) ||
      ticket.users?.display_name?.toLowerCase().includes(searchLower) ||
      ticket.users?.email?.toLowerCase().includes(searchLower) ||
      ticket.ticket_types?.name?.toLowerCase().includes(searchLower)
    );
  });

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
          <p>Chargement des billets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billets vendus</h1>
        <p className="text-muted-foreground">
          Gérez et téléchargez les billets de vos événements
        </p>
      </div>

      {/* Recherche */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Rechercher un billet</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="search"
              placeholder="Rechercher par événement, participant ou type de billet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredTickets.length} billet{filteredTickets.length > 1 ? 's' : ''} trouvé{filteredTickets.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des billets */}
      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Aucun billet trouvé</h2>
              <p className="text-muted-foreground">
                {searchTerm ? "Aucun billet ne correspond à votre recherche." : "Aucun billet n'a encore été vendu pour vos événements."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const event = ticket.events;
            const eventStatus = getEventStatus(event);
            
            return (
              <Card key={ticket.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{event?.title}</CardTitle>
                        <Badge className={eventStatus.color}>
                          {eventStatus.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event?.starts_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event?.venue}, {event?.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{ticket.users?.display_name || ticket.users?.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {(ticket.ticket_types?.price_cents / 100).toFixed(2)}€
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.ticket_types?.name}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      ID: {ticket.id} • Acheté le {new Date(ticket.orders?.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTicket(ticket.id)}
                        disabled={downloadingTickets[ticket.id]}
                      >
                        {downloadingTickets[ticket.id] ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        {downloadingTickets[ticket.id] ? 'Génération...' : 'Télécharger'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Tickets;
