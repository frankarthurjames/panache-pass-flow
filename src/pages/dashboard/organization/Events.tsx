import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Calendar, Users, TrendingUp, Eye, Edit, MoreHorizontal, Copy, BarChart, Download, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Events = () => {
  const { orgId } = useParams();
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers pour les actions
  const handleDuplicateEvent = async (eventId: string) => {
    try {
      // Récupérer l'événement à dupliquer
      const { data: originalEvent, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) {
        toast.error("Erreur lors de la récupération de l'événement");
        return;
      }

      // Créer une copie avec un nouveau titre
      const duplicatedEvent = {
        title: `${originalEvent.title} (Copie)`,
        description: originalEvent.description,
        starts_at: originalEvent.starts_at,
        ends_at: originalEvent.ends_at,
        venue: originalEvent.venue,
        city: originalEvent.city,
        capacity: originalEvent.capacity,
        organization_id: originalEvent.organization_id,
        images: originalEvent.images,
        status: 'draft' as const,
      };

      const { error: createError } = await supabase
        .from('events')
        .insert(duplicatedEvent);

      if (createError) {
        toast.error("Erreur lors de la duplication");
        return;
      }

      toast.success("Événement dupliqué avec succès!");
      // Ici on pourrait recharger la liste des événements
    } catch (error) {
      toast.error("Erreur lors de la duplication");
    }
  };

  const handleShowStats = (eventId: string) => {
    // Rediriger vers la page de statistiques
    window.open(`/dashboard/org/${orgId}/events/${eventId}/analytics`, '_blank');
  };

  const handleExportParticipants = async (eventId: string) => {
    try {
      // Récupérer les participants de l'événement
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
          *,
          users:user_id (
            display_name,
            email
          ),
          ticket_types:ticket_type_id (
            name,
            price_cents
          )
        `)
        .eq('event_id', eventId);

      if (error) {
        toast.error("Erreur lors de la récupération des participants");
        return;
      }

      // Créer le CSV
      const csvHeaders = ['Nom', 'Email', 'Type de billet', 'Prix', 'Status', 'Date d\'inscription'];
      const csvRows = registrations.map(reg => [
        reg.users?.display_name || 'N/A',
        reg.users?.email || 'N/A',
        reg.ticket_types?.name || 'N/A',
        reg.ticket_types?.price_cents ? `${(reg.ticket_types.price_cents / 100).toFixed(2)}€` : '0€',
        reg.status,
        new Date(reg.created_at).toLocaleDateString('fr-FR')
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `participants-event-${eventId}.csv`;
      link.click();

      toast.success("Export terminé!");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setIsDeleting(true);
    try {
      // D'abord supprimer les registrations liées
      const { error: registrationsError } = await supabase
        .from('registrations')
        .delete()
        .eq('event_id', eventId);

      if (registrationsError) {
        toast.error("Erreur lors de la suppression des inscriptions");
        return;
      }

      // Supprimer les ticket types
      const { error: ticketTypesError } = await supabase
        .from('ticket_types')
        .delete()
        .eq('event_id', eventId);

      if (ticketTypesError) {
        toast.error("Erreur lors de la suppression des types de billets");
        return;
      }

      // Enfin supprimer l'événement
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (eventError) {
        toast.error("Erreur lors de la suppression de l'événement");
        return;
      }

      toast.success("Événement supprimé avec succès!");
      setDeleteEventId(null);
      // Ici on pourrait recharger la liste des événements
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!orgId) return;
      
      try {
        // Récupérer les événements de l'organisation
        const { data: eventsList, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            starts_at,
            status,
            capacity,
            created_at
          `)
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });

        if (eventsError) throw eventsError;

        // Pour chaque événement, récupérer les statistiques
        const eventsWithStats = await Promise.all(
          eventsList.map(async (event: any) => {
            // Compter les participants
            const { count: participantsCount } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id);

            // Calculer les revenus
            const { data: payments } = await supabase
              .from('payments')
              .select('amount_cents, orders!inner(*)')
              .eq('orders.event_id', event.id);

            const revenue = payments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;

            const statusMap: any = {
              'published': { label: 'Publié', color: 'bg-green-500' },
              'draft': { label: 'Brouillon', color: 'bg-yellow-500' },
              'cancelled': { label: 'Annulé', color: 'bg-red-500' }
            };

            return {
              id: event.id,
              title: event.title,
              date: new Date(event.starts_at).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              }),
              status: statusMap[event.status]?.label || 'En attente',
              participants: `${participantsCount || 0}/${event.capacity || 0}`,
              revenue: `${(revenue / 100).toFixed(0)}€`,
              statusColor: statusMap[event.status]?.color || 'bg-blue-500',
              category: "Sport" // À implémenter plus tard avec une vraie catégorie
            };
          })
        );

        setEvents(eventsWithStats);

        // Calculer les stats
        const totalEvents = eventsList.length;
        const totalParticipants = eventsWithStats.reduce((sum, event) => {
          const participants = parseInt(event.participants.split('/')[0]);
          return sum + participants;
        }, 0);
        const totalRevenue = eventsWithStats.reduce((sum, event) => {
          const revenue = parseInt(event.revenue.replace('€', ''));
          return sum + revenue;
        }, 0);

        setStats([
          {
            title: "Total événements",
            value: totalEvents.toString(),
            change: "+2 ce mois",
            icon: Calendar,
          },
          {
            title: "Participants inscrits",
            value: totalParticipants.toString(),
            change: "+23 cette semaine",
            icon: Users,
          },
          {
            title: "Revenus générés",
            value: `${totalRevenue}€`,
            change: "+1,260€ ce mois",
            icon: TrendingUp,
          },
        ]);

      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [orgId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Événements</h1>
          <p className="text-muted-foreground">
            Gérez tous vos événements depuis cette page
          </p>
        </div>
        <Button size="lg" asChild>
          <Link to={`/dashboard/org/${orgId}/events/new`}>
            <Plus className="w-5 h-5 mr-2" />
            Créer un événement
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un événement..."
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="tennis">Tennis</SelectItem>
            <SelectItem value="course">Course</SelectItem>
            <SelectItem value="badminton">Badminton</SelectItem>
            <SelectItem value="football">Football</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${event.statusColor}`} />
                        {event.status}
                      </Badge>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.participants}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {event.revenue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/events/${event.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/dashboard/org/${orgId}/events/${event.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicateEvent(event.id.toString())}>
                        <Copy className="w-4 h-4 mr-2" />
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShowStats(event.id.toString())}>
                        <BarChart className="w-4 h-4 mr-2" />
                        Statistiques détaillées
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportParticipants(event.id.toString())}>
                        <Download className="w-4 h-4 mr-2" />
                        Exporter les participants
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={() => setDeleteEventId(event.id.toString())}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {events.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucun événement créé</h3>
          <p className="text-muted-foreground mb-6">
            Créez votre premier événement pour commencer à vendre des billets
          </p>
          <Button asChild>
            <Link to={`/dashboard/org/${orgId}/events/new`}>
              <Plus className="w-4 h-4 mr-2" />
              Créer mon premier événement
            </Link>
          </Button>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
              Tous les participants inscrits et les données associées seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && handleDeleteEvent(deleteEventId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Events;