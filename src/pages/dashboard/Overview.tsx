import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Building2, Users, Calendar, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Overview = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Récupérer les organisations
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

        // Dates pour les comparaisons
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

              // Compter les événements totaux
              const { count: eventsCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', org.id);

              // Compter les événements ce mois
              const { count: eventsThisMonth } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', org.id)
                .gte('created_at', startOfMonth.toISOString());

              // Compter les événements le mois dernier
              const { count: eventsLastMonth } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', org.id)
                .gte('created_at', startOfLastMonth.toISOString())
                .lt('created_at', startOfMonth.toISOString());

              // Compter les participants totaux
              const { count: participantsCount } = await supabase
                .from('registrations')
                .select('*, events!inner(*)')
                .eq('events.organization_id', org.id);

              // Compter les participants cette semaine
              const { count: participantsThisWeek } = await supabase
                .from('registrations')
                .select('*, events!inner(*)')
                .eq('events.organization_id', org.id)
                .gte('created_at', startOfWeek.toISOString());

              // Compter les participants la semaine dernière
              const { count: participantsLastWeek } = await supabase
                .from('registrations')
                .select('*, events!inner(*)')
                .eq('events.organization_id', org.id)
                .gte('created_at', startOfLastWeek.toISOString())
                .lt('created_at', startOfWeek.toISOString());

              // Calculer les revenus totaux
              const { data: allPayments } = await supabase
                .from('payments')
                .select('amount_cents, orders!inner(*, events!inner(*))')
                .eq('orders.events.organization_id', org.id);

              // Calculer les revenus ce mois
              const { data: paymentsThisMonth } = await supabase
                .from('payments')
                .select('amount_cents, orders!inner(*, events!inner(*))')
                .eq('orders.events.organization_id', org.id)
                .gte('created_at', startOfMonth.toISOString());

              // Calculer les revenus le mois dernier
              const { data: paymentsLastMonth } = await supabase
                .from('payments')
                .select('amount_cents, orders!inner(*, events!inner(*))')
                .eq('orders.events.organization_id', org.id)
                .gte('created_at', startOfLastMonth.toISOString())
                .lt('created_at', startOfMonth.toISOString());

              const monthlyRevenue = paymentsThisMonth?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;
              const totalOrgRevenue = allPayments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;

              // Ajouter aux totaux globaux
              totalEvents += eventsCount || 0;
              totalEventsThisMonth += eventsThisMonth || 0;
              totalEventsLastMonth += eventsLastMonth || 0;
              totalParticipants += participantsCount || 0;
              totalParticipantsThisWeek += participantsThisWeek || 0;
              totalParticipantsLastWeek += participantsLastWeek || 0;
              totalRevenue += totalOrgRevenue;
              totalRevenueThisMonth += monthlyRevenue;
              totalRevenueLastMonth += paymentsLastMonth?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;

              return {
                id: org.id,
                name: org.name,
                logo: org.logo_url,
                eventsCount: eventsCount || 0,
                totalParticipants: participantsCount || 0,
                monthlyRevenue: `${(monthlyRevenue / 100).toFixed(0)}€`,
                status: "Actif",
                lastActivity: "Il y a 2h"
              };
            })
          );

          setOrganizations(orgsWithStats);

          // Calculer les variations
          const eventsVariation = totalEventsThisMonth - totalEventsLastMonth;
          const participantsVariation = totalParticipantsThisWeek - totalParticipantsLastWeek;
          const revenueVariation = totalRevenueThisMonth - totalRevenueLastMonth;

          // Mettre à jour les stats globales avec de vraies données
          setGlobalStats([
            {
              title: "Organisations actives",
              value: validMembers.length.toString(),
              change: `+${validMembers.length} ce mois`,
              icon: Building2,
            },
            {
              title: "Événements total",
              value: totalEvents.toString(),
              change: `${eventsVariation >= 0 ? '+' : ''}${eventsVariation} ce mois`,
              icon: Calendar,
            },
            {
              title: "Participants total",
              value: totalParticipants.toString(),
              change: `${participantsVariation >= 0 ? '+' : ''}${participantsVariation} cette semaine`,
              icon: Users,
            },
            {
              title: "Revenus total",
              value: `${(totalRevenue / 100).toFixed(0)}€`,
              change: `${revenueVariation >= 0 ? '+' : ''}${(revenueVariation / 100).toFixed(0)}€ ce mois`,
              icon: TrendingUp,
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setOrganizations([]);
        setGlobalStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Organisateur'} 👋
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de toutes vos organisations et activités
          </p>
        </div>
        <Button size="lg" asChild className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 shadow-md transition-all hover:shadow-lg">
          <Link to="/dashboard/organizations/new">
            <Plus className="w-5 h-5 mr-2" />
            Créer une organisation
          </Link>
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalStats.map((stat) => (
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

      {/* Organizations Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes organisations</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/organizations">
              Voir toutes
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="text-center py-8 col-span-2">Chargement...</div>
          ) : organizations.map((org) => (
            <Link key={org.id} to={`/dashboard/org/${org.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={org.logo || ""} />
                        <AvatarFallback className="text-lg font-semibold">
                          {org.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{org.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {org.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {org.lastActivity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{org.eventsCount}</div>
                      <div className="text-xs text-muted-foreground">Événements</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{org.totalParticipants}</div>
                      <div className="text-xs text-muted-foreground">Participants</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{org.monthlyRevenue}</div>
                      <div className="text-xs text-muted-foreground">Ce mois</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {organizations.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune organisation créée</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre première organisation pour commencer à organiser des événements
            </p>
            <Button asChild>
              <Link to="/dashboard/organizations/new">
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première organisation
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Overview;