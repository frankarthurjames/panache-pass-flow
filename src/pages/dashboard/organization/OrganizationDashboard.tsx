import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, TrendingUp, Eye, Edit, MoreHorizontal, Euro, BarChart } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OrganizationDashboard = () => {
  const { orgId } = useParams();
  const [organization, setOrganization] = useState<any>(null);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!orgId) return;

      try {
        // Récupérer l'organisation
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (orgError) throw orgError;
        setOrganization(org);

        // Récupérer les événements récents
        const { data: events, error: eventsError } = await supabase
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
          .order('created_at', { ascending: false })
          .limit(5);

        if (eventsError) throw eventsError;

        // Pour chaque événement, récupérer les statistiques
        const eventsWithStats = await Promise.all(
          events.map(async (event: any) => {
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
              statusColor: statusMap[event.status]?.color || 'bg-blue-500'
            };
          })
        );

        setUserEvents(eventsWithStats);

        // Calculer les stats globales avec comparaisons de périodes
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);

        const totalEvents = events.length;

        // Compter les événements créés ce mois
        const eventsThisMonth = events.filter(event =>
          new Date(event.created_at) >= startOfMonth
        ).length;

        // Compter les événements créés le mois dernier
        const eventsLastMonth = events.filter(event => {
          const eventDate = new Date(event.created_at);
          return eventDate >= startOfLastMonth && eventDate < startOfMonth;
        }).length;

        const totalParticipants = eventsWithStats.reduce((sum, event) => {
          const participants = parseInt(event.participants.split('/')[0]);
          return sum + participants;
        }, 0);

        // Compter les participants cette semaine
        const participantsThisWeek = await supabase
          .from('registrations')
          .select('*, events!inner(*)')
          .eq('events.organization_id', orgId)
          .gte('created_at', startOfWeek.toISOString());

        const participantsLastWeek = await supabase
          .from('registrations')
          .select('*, events!inner(*)')
          .eq('events.organization_id', orgId)
          .gte('created_at', startOfLastWeek.toISOString())
          .lt('created_at', startOfWeek.toISOString());

        const totalRevenue = eventsWithStats.reduce((sum, event) => {
          const revenue = parseInt(event.revenue.replace('€', ''));
          return sum + revenue;
        }, 0);

        // Calculer les revenus ce mois
        const paymentsThisMonth = await supabase
          .from('payments')
          .select('amount_cents, orders!inner(*, events!inner(*))')
          .eq('orders.events.organization_id', orgId)
          .gte('created_at', startOfMonth.toISOString());

        const paymentsLastMonth = await supabase
          .from('payments')
          .select('amount_cents, orders!inner(*, events!inner(*))')
          .eq('orders.events.organization_id', orgId)
          .gte('created_at', startOfLastMonth.toISOString())
          .lt('created_at', startOfMonth.toISOString());

        const monthlyRevenue = paymentsThisMonth.data?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;
        const lastMonthRevenue = paymentsLastMonth.data?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;

        // Calculer les variations
        const eventsVariation = eventsThisMonth - eventsLastMonth;
        const participantsVariation = (participantsThisWeek.count || 0) - (participantsLastWeek.count || 0);
        const revenueVariation = monthlyRevenue - lastMonthRevenue;

        setStats([
          {
            title: "Événements créés",
            value: totalEvents.toString(),
            change: `${eventsVariation >= 0 ? '+' : ''}${eventsVariation} ce mois`,
            icon: Calendar,
          },
          {
            title: "Total participants",
            value: totalParticipants.toString(),
            change: `${participantsVariation >= 0 ? '+' : ''}${participantsVariation} cette semaine`,
            icon: Users,
          },
          {
            title: "Revenus générés",
            value: `${totalRevenue}€`,
            change: `${revenueVariation >= 0 ? '+' : ''}${(revenueVariation / 100).toFixed(0)}€ ce mois`,
            icon: TrendingUp,
          },
        ]);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
            <AvatarImage src={organization?.logo_url || ""} />
            <AvatarFallback className="text-lg sm:text-xl font-semibold">
              {organization?.name?.charAt(0) || 'O'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 truncate">{organization?.name || 'Organisation'}</h1>
            <p className="text-sm text-muted-foreground">
              Tableau de bord de votre organisation
            </p>
          </div>
        </div>
        <Button size="default" asChild className="w-full sm:w-auto rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 shadow-md transition-all hover:shadow-lg">
          <Link to={`/dashboard/org/${orgId}/events/new`}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un événement
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-xl border-gray-100 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-orange-50 rounded-lg">
                <stat.icon className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1 text-gray-900">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Événements récents</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/org/${orgId}/events`}>
              Voir tous
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : userEvents.map((event) => (
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
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {event.participants}
                        </span>
                        <span className="flex items-center gap-1">
                          <Euro className="w-3.5 h-3.5" />
                          {event.revenue}
                        </span>
                      </div>
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
                        <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                        <DropdownMenuItem>Statistiques</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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

        {userEvents.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun événement créé</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre premier événement pour commencer à vendre des billets
            </p>
            <Button asChild>
              <Link to={`/dashboard/org/${orgId}/events/new`}>
                
                Créer mon premier événement
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrganizationDashboard;