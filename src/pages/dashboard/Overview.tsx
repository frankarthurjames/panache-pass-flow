import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Building2, Users, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Core components
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";

const Overview = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: orgMembers, error: membersError } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            role,
            organizations (
              id,
              name,
              logo_url,
              created_at
            )
          `)
          .eq('user_id', user.id);

        if (membersError) throw membersError;

        let totalEvents = 0;
        let totalParticipants = 0;
        let totalRevenue = 0;
        let totalEventsThisMonth = 0;
        let totalEventsLastMonth = 0;
        let totalParticipantsThisWeek = 0;
        let totalParticipantsLastWeek = 0;
        let totalRevenueThisMonth = 0;
        let totalRevenueLastMonth = 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);

        if (orgMembers) {
          const validMembers = orgMembers.filter((m: any) => m.organizations);
          const orgsWithStats = await Promise.all(
            validMembers.map(async (member: any) => {
              const org = member.organizations;

              const { count: eventsCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', org.id);

              const { count: eventsThisMonth } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', org.id)
                .gte('created_at', startOfMonth.toISOString());

              const { count: eventsLastMonth } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', org.id)
                .gte('created_at', startOfLastMonth.toISOString())
                .lt('created_at', startOfMonth.toISOString());

              const { count: participantsCount } = await supabase
                .from('registrations')
                .select('*, events!inner(*)')
                .eq('events.organization_id', org.id);

              const { count: participantsThisWeek } = await supabase
                .from('registrations')
                .select('*, events!inner(*)')
                .eq('events.organization_id', org.id)
                .gte('created_at', startOfWeek.toISOString());

              const { count: participantsLastWeek } = await supabase
                .from('registrations')
                .select('*, events!inner(*)')
                .eq('events.organization_id', org.id)
                .gte('created_at', startOfLastWeek.toISOString())
                .lt('created_at', startOfWeek.toISOString());

              const { data: revenueData } = await supabase
                .from('orders')
                .select('total_cents, status, events!inner(organization_id), created_at')
                .eq('events.organization_id', org.id)
                .eq('status', 'paid');

              const orgRevenue = revenueData ? revenueData.reduce((sum, order: any) => sum + (order.total_cents || 0), 0) / 100 : 0;
              const orgRevenueThisMonth = revenueData ? revenueData
                .filter((o: any) => new Date(o.created_at) >= startOfMonth)
                .reduce((sum, order: any) => sum + (order.total_cents || 0), 0) / 100 : 0;
              const orgRevenueLastMonth = revenueData ? revenueData
                .filter((o: any) => new Date(o.created_at) >= startOfLastMonth && new Date(o.created_at) < startOfMonth)
                .reduce((sum, order: any) => sum + (order.total_cents || 0), 0) / 100 : 0;

              totalEvents += eventsCount || 0;
              totalEventsThisMonth += eventsThisMonth || 0;
              totalEventsLastMonth += eventsLastMonth || 0;
              totalParticipants += participantsCount || 0;
              totalParticipantsThisWeek += participantsThisWeek || 0;
              totalParticipantsLastWeek += participantsLastWeek || 0;
              totalRevenue += orgRevenue;
              totalRevenueThisMonth += orgRevenueThisMonth;
              totalRevenueLastMonth += orgRevenueLastMonth;

              return {
                ...org,
                role: member.role,
                stats: {
                  events: eventsCount || 0,
                  participants: participantsCount || 0,
                  revenue: orgRevenue
                }
              };
            })
          );

          setOrganizations(orgsWithStats);
          
          setGlobalStats([
            {
              title: "Événements",
              value: totalEvents,
              icon: <Calendar className="h-5 w-5" />,
              trend: {
                value: `+${totalEventsThisMonth}`,
                label: "ce mois",
                isPositive: totalEventsThisMonth > totalEventsLastMonth,
                isNeutral: totalEventsThisMonth === totalEventsLastMonth
              }
            },
            {
              title: "Participants",
              value: totalParticipants,
              icon: <Users className="h-5 w-5" />,
              trend: {
                value: `+${totalParticipantsThisWeek}`,
                label: "cette semaine",
                isPositive: totalParticipantsThisWeek > totalParticipantsLastWeek,
                isNeutral: totalParticipantsThisWeek === totalParticipantsLastWeek
              }
            },
            {
              title: "Revenus",
              value: `${totalRevenue.toFixed(2)}€`,
              icon: <TrendingUp className="h-5 w-5" />,
              trend: {
                value: `${totalRevenueThisMonth > 0 ? '+' : ''}${totalRevenueThisMonth.toFixed(2)}€`,
                label: "ce mois",
                isPositive: totalRevenueThisMonth > totalRevenueLastMonth,
                isNeutral: totalRevenueThisMonth === totalRevenueLastMonth
              }
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </PageContainer>
    );
  }

  const columns = [
    {
      header: "Organisation",
      accessorKey: "name",
      cell: (org: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={org.logo_url} />
            <AvatarFallback>{org.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{org.name}</span>
            <span className="text-xs text-gray-500 capitalize">{org.role}</span>
          </div>
        </div>
      )
    },
    {
      header: "Événements",
      accessorKey: "events",
      cell: (org: any) => (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-semibold rounded-md">
          {org.stats.events}
        </Badge>
      )
    },
    {
      header: "Participants",
      accessorKey: "participants",
      cell: (org: any) => (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-semibold rounded-md">
          {org.stats.participants}
        </Badge>
      )
    },
    {
      header: "Revenus",
      accessorKey: "revenue",
      className: "text-right",
      cell: (org: any) => (
        <span className="font-bold text-gray-900">
          {org.stats.revenue.toFixed(2)}€
        </span>
      )
    },
    {
      header: "Actions",
      accessorKey: "actions",
      className: "text-right",
      cell: (org: any) => (
        <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100">
          <Link to={`/dashboard/org/${org.id}`}>
            Gérer
          </Link>
        </Button>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Vue d'ensemble"
        description="Gérez toutes vos organisations et événements depuis un seul endroit."
        action={
          <Button asChild className="bg-black hover:bg-black/90 text-white shadow-sm font-semibold rounded-xl w-full sm:w-auto">
            <Link to="/dashboard/organizations/new">
              
              Créer une organisation
            </Link>
          </Button>
        }
      />

      {organizations.length > 0 ? (
        <div className="space-y-8">
          {/* Global Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {globalStats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Organizations List */}
          <DashboardCard
            title="Mes organisations"
            description="Vue détaillée de l'activité de vos organisations"
            contentClassName="p-0"
          >
            <DataTable 
              data={organizations} 
              columns={columns} 
              keyExtractor={(org) => org.id} 
              className="border-0 shadow-none"
            />
          </DashboardCard>
        </div>
      ) : (
        <EmptyState
          icon={undefined}
          title="Bienvenue sur votre tableau de bord"
          description="Vous ne faites partie d'aucune organisation pour le moment. Créez-en une pour commencer à publier des événements."
          actionLabel="Créer ma première organisation"
          actionUrl="/dashboard/organizations/new"
        />
      )}
    </PageContainer>
  );
};

export default Overview;
