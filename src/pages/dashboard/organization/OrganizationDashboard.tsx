import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, TrendingUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { PageContainer } from "@/components/layout/PageContainer";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { EventCardRow } from "@/components/dashboard/EventCardRow";

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
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (orgError) throw orgError;
        setOrganization(org);

        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select(`id, title, starts_at, status, capacity, created_at`)
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (eventsError) throw eventsError;

        const eventsWithStats = await Promise.all(
          events.map(async (event: any) => {
            const { count: participantsCount } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id);

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
                day: 'numeric', month: 'short', year: 'numeric'
              }),
              status: statusMap[event.status]?.label || 'En attente',
              participants: `${participantsCount || 0}/${event.capacity || 0}`,
              revenue: `${(revenue / 100).toFixed(0)}€`,
              statusColor: statusMap[event.status]?.color || 'bg-blue-500'
            };
          })
        );

        setUserEvents(eventsWithStats);

        // Stats with period comparison
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);

        const totalEvents = events.length;
        const eventsThisMonth = events.filter(e => new Date(e.created_at) >= startOfMonth).length;
        const eventsLastMonth = events.filter(e => {
          const d = new Date(e.created_at);
          return d >= startOfLastMonth && d < startOfMonth;
        }).length;

        const totalParticipants = eventsWithStats.reduce((sum, e) => sum + parseInt(e.participants.split('/')[0]), 0);

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

        const totalRevenue = eventsWithStats.reduce((sum, e) => sum + parseInt(e.revenue.replace('€', '')), 0);

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

        const monthlyRevenue = paymentsThisMonth.data?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;
        const lastMonthRevenue = paymentsLastMonth.data?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;

        setStats([
          {
            title: "Événements créés",
            value: totalEvents.toString(),
            icon: <Calendar className="h-5 w-5" />,
            trend: {
              value: `${eventsThisMonth - eventsLastMonth >= 0 ? '+' : ''}${eventsThisMonth - eventsLastMonth}`,
              label: "ce mois",
              isPositive: eventsThisMonth > eventsLastMonth,
              isNeutral: eventsThisMonth === eventsLastMonth
            }
          },
          {
            title: "Total participants",
            value: totalParticipants.toString(),
            icon: <Users className="h-5 w-5" />,
            trend: {
              value: `${(participantsThisWeek.count || 0) - (participantsLastWeek.count || 0) >= 0 ? '+' : ''}${(participantsThisWeek.count || 0) - (participantsLastWeek.count || 0)}`,
              label: "cette semaine",
              isPositive: (participantsThisWeek.count || 0) > (participantsLastWeek.count || 0),
              isNeutral: (participantsThisWeek.count || 0) === (participantsLastWeek.count || 0)
            }
          },
          {
            title: "Revenus générés",
            value: `${totalRevenue}€`,
            icon: <TrendingUp className="h-5 w-5" />,
            trend: {
              value: `${monthlyRevenue - lastMonthRevenue >= 0 ? '+' : ''}${((monthlyRevenue - lastMonthRevenue) / 100).toFixed(0)}€`,
              label: "ce mois",
              isPositive: monthlyRevenue > lastMonthRevenue,
              isNeutral: monthlyRevenue === lastMonthRevenue
            }
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
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 mb-8">
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

      {/* Stats Cards — reusing StatsCard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Events List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Événements récents</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/org/${orgId}/events`}>Voir tous</Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : userEvents.map((event) => (
            <EventCardRow
              key={event.id}
              event={event}
              orgId={orgId!}
              dropdownItems={[
                { label: "Dupliquer", onClick: () => {} },
                { label: "Statistiques", onClick: () => {} },
                { label: "Supprimer", onClick: () => {}, destructive: true },
              ]}
            />
          ))}
        </div>

        {!loading && userEvents.length === 0 && (
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="Aucun événement créé"
            description="Créez votre premier événement pour commencer à vendre des billets"
            actionLabel="Créer mon premier événement"
            actionUrl={`/dashboard/org/${orgId}/events/new`}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default OrganizationDashboard;
