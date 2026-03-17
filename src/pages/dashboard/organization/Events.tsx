import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Calendar, Users, TrendingUp, Eye, Edit, MoreHorizontal, Copy, BarChart, Download, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [loadingStripe, setLoadingStripe] = useState(true);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  
  // États pour l'infinit scrolling
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const ITEMS_PER_PAGE = 10;

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      // Recharger la liste des événements
      fetchEvents(1, true);
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
      // Recharger la liste des événements
      fetchEvents(1, true);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Vérifier le statut Stripe
  useEffect(() => {
    const checkStripeStatus = async () => {
      if (!user || !orgId) return;
      
      try {
        const response = await supabase.functions.invoke('check-connect-status', {
          body: { organizationId: orgId }
        });

        if (response.error) {
          console.error('Erreur lors de la vérification Stripe:', response.error);
          setStripeStatus({ connected: false, charges_enabled: false });
        } else {
          setStripeStatus(response.data);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification Stripe:', error);
        setStripeStatus({ connected: false, charges_enabled: false });
      } finally {
        setLoadingStripe(false);
      }
    };

    checkStripeStatus();
  }, [user, orgId]);

  // Fonction pour récupérer les événements avec pagination
  const fetchEvents = async (page: number = 1, reset: boolean = false) => {
    if (!orgId) return;
    
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
        setAllEvents([]);
        setFilteredEvents([]);
      } else {
        setIsLoadingMore(true);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Récupérer les événements de l'organisation avec pagination
      const { data: eventsList, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          starts_at,
          status,
          capacity,
          created_at,
          description,
          venue,
          city
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (eventsError) throw eventsError;

      // Pour chaque événement, récupérer les statistiques
      const eventsWithStats = await Promise.all(
        eventsList.map(async (event: any) => {
          // Compter les participants (seulement les inscriptions payées)
          const { count: participantsCount } = await supabase
            .from('registrations')
            .select('*, orders!inner(*)', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('orders.status', 'paid');

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

          // Déterminer la catégorie basée sur le titre ou la description
          const getCategory = (title: string, description: string) => {
            const text = (title + ' ' + description).toLowerCase();
            if (text.includes('tennis')) return 'Tennis';
            if (text.includes('football') || text.includes('soccer')) return 'Football';
            if (text.includes('basketball') || text.includes('basket')) return 'Basketball';
            if (text.includes('course') || text.includes('running') || text.includes('marathon')) return 'Course';
            if (text.includes('badminton')) return 'Badminton';
            if (text.includes('volleyball') || text.includes('volley')) return 'Volleyball';
            if (text.includes('swimming') || text.includes('natation')) return 'Natation';
            if (text.includes('golf')) return 'Golf';
            if (text.includes('rugby')) return 'Rugby';
            if (text.includes('handball')) return 'Handball';
            return 'Sport';
          };

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            venue: event.venue,
            city: event.city,
            date: new Date(event.starts_at).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }),
            status: statusMap[event.status]?.label || 'En attente',
            statusValue: event.status,
            participants: `${participantsCount || 0}/${event.capacity || 0}`,
            revenue: `${(revenue / 100).toFixed(0)}€`,
            statusColor: statusMap[event.status]?.color || 'bg-blue-500',
            category: getCategory(event.title, event.description || '')
          };
        })
      );

      if (reset) {
        setAllEvents(eventsWithStats);
        setFilteredEvents(eventsWithStats);
      } else {
        setAllEvents(prev => [...prev, ...eventsWithStats]);
        setFilteredEvents(prev => [...prev, ...eventsWithStats]);
      }

      // Vérifier s'il y a plus d'événements
      setHasMore(eventsList.length === ITEMS_PER_PAGE);

      // Calculer les stats globales (une seule fois)
      if (reset) {
        const totalEvents = eventsWithStats.length;
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
      }

    } catch (error) {
      console.error('Error fetching events:', error);
      if (reset) {
        setEvents([]);
        setStats([]);
      }
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Charger les événements au montage
  useEffect(() => {
    fetchEvents(1, true);
  }, [orgId]);

  // Rafraîchir les données automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (orgId) {
        fetchEvents(1, true);
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [orgId]);


  // Fonction de filtrage
  const applyFilters = () => {
    let filtered = [...allEvents];

    // Filtre par recherche
    if (debouncedSearchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        event.city?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(event => event.statusValue === statusFilter);
    }

    // Filtre par catégorie
    if (categoryFilter !== "all") {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    setFilteredEvents(filtered);
  };

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters();
  }, [debouncedSearchTerm, statusFilter, categoryFilter, allEvents]);

  // Fonction pour charger plus d'événements automatiquement
  const loadMoreEvents = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchEvents(nextPage, false);
    }
  };

  // Intersection Observer pour l'infinit scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreEvents();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const loadMoreElement = document.getElementById('load-more-trigger');
    if (loadMoreElement) {
      observer.observe(loadMoreElement);
    }

    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement);
      }
    };
  }, [hasMore, isLoadingMore, currentPage, allEvents.length]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Événements</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous vos événements depuis cette page
          </p>
        </div>
        {loadingStripe ? (
          <Button size="default" disabled className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Vérification...
          </Button>
        ) : stripeStatus?.connected && stripeStatus?.charges_enabled ? (
          <Button size="default" asChild className="w-full sm:w-auto">
            <Link to={`/dashboard/org/${orgId}/events/new`}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un événement
            </Link>
          </Button>
        ) : (
          <Button size="default" asChild className="w-full sm:w-auto">
            <Link to={`/dashboard/org/${orgId}/settings`}>
              <Plus className="w-4 h-4 mr-2" />
              Configurer Stripe d'abord
            </Link>
          </Button>
        )}
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="Tennis">Tennis</SelectItem>
            <SelectItem value="Course">Course</SelectItem>
            <SelectItem value="Badminton">Badminton</SelectItem>
            <SelectItem value="Football">Football</SelectItem>
            <SelectItem value="Basketball">Basketball</SelectItem>
            <SelectItem value="Volleyball">Volleyball</SelectItem>
            <SelectItem value="Natation">Natation</SelectItem>
            <SelectItem value="Golf">Golf</SelectItem>
            <SelectItem value="Rugby">Rugby</SelectItem>
            <SelectItem value="Handball">Handball</SelectItem>
            <SelectItem value="Sport">Sport</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {/* Compteur d'événements */}
        {!loading && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <p>
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} 
              {debouncedSearchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? ' trouvé(s)' : ''}
            </p>
            {(debouncedSearchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{event.title}</h3>
                    <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${event.statusColor}`} />
                      {event.status}
                    </Badge>
                    <Badge variant="outline" className="shrink-0">{event.category}</Badge>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.date}
                      </span>
                      {event.venue && (
                        <span className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 text-center">📍</span>
                          <span className="truncate max-w-[120px] sm:max-w-[200px]">{event.venue}{event.city && `, ${event.city}`}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {event.participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {event.revenue}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-1 sm:line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 shrink-0 self-end sm:self-center">
                  <Button variant="outline" size="sm" asChild className="gap-1 text-xs sm:text-sm">
                    <Link to={`/dashboard/org/${orgId}/events/${event.id}/analytics`}>
                      <BarChart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Stats</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link to={`/events/${event.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link to={`/dashboard/org/${orgId}/events/${event.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
        
        {/* Infinit scrolling - Élément de déclenchement invisible pour chargement automatique */}
        {hasMore && !loading && (
          <div id="load-more-trigger" className="h-10 flex items-center justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span>Chargement automatique...</span>
              </div>
            )}
          </div>
        )}
        
        {/* Indicateur de fin */}
        {!hasMore && filteredEvents.length > 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p>Tous les événements ont été chargés</p>
          </div>
        )}
      </div>
      
      {filteredEvents.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {!stripeStatus?.connected || !stripeStatus?.charges_enabled 
              ? "Configuration Stripe requise" 
              : "Aucun événement créé"
            }
          </h3>
          <p className="text-muted-foreground mb-6">
            {!stripeStatus?.connected || !stripeStatus?.charges_enabled 
              ? "Vous devez configurer votre compte Stripe pour créer des événements payants"
              : "Créez votre premier événement pour commencer à vendre des billets"
            }
          </p>
          <Button asChild>
            <Link to={
              !stripeStatus?.connected || !stripeStatus?.charges_enabled 
                ? `/dashboard/org/${orgId}/settings`
                : `/dashboard/org/${orgId}/events/new`
            }>
              
              {!stripeStatus?.connected || !stripeStatus?.charges_enabled 
                ? "Configurer Stripe"
                : "Créer mon premier événement"
              }
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