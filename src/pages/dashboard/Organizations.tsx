import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Calendar, TrendingUp, Activity, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";

const Organizations = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
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

        if (orgMembers) {
          const validMembers = orgMembers.filter((m: any) => m.organizations);
          const orgsWithStats = await Promise.all(
            validMembers.map(async (member: any) => {
              const org = member.organizations;

              const now = new Date();
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              startOfWeek.setHours(0, 0, 0, 0);
              const startOfLastWeek = new Date(startOfWeek);
              startOfLastWeek.setDate(startOfWeek.getDate() - 7);

              const { count: totalEventsCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', org.id);

              const { count: totalParticipantsCount } = await supabase
                .from('registrations')
                .select('*, events!inner(*), orders!inner(*)')
                .eq('events.organization_id', org.id)
                .eq('orders.status', 'paid');

              const { data: paymentsThisMonth } = await supabase
                .from('payments')
                .select('amount_cents, orders!inner(*, events!inner(*))')
                .eq('orders.events.organization_id', org.id)
                .gte('created_at', startOfMonth.toISOString());

              const monthlyRevenue = paymentsThisMonth?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;

              return {
                id: org.id,
                name: org.name,
                logo: org.logo_url,
                eventsCount: totalEventsCount || 0,
                totalParticipants: totalParticipantsCount || 0,
                monthlyRevenue: `${(monthlyRevenue / 100).toFixed(0)}€`,
                status: "Actif",
                createdAt: new Date(org.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })
              };
            })
          );

          setOrganizations(orgsWithStats);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [user]);

  return (
    <PageContainer>
      <PageHeader
        title="Mes organisations"
        description="Gérez toutes vos organisations depuis cette page"
        action={
          <Button size="lg" asChild className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 shadow-md transition-all hover:shadow-lg w-full sm:w-auto">
            <Link to="/dashboard/organizations/new">
              <Plus className="w-4 h-4 mr-2" />
              Créer une organisation
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                    <AvatarImage src={org.logo || ""} />
                    <AvatarFallback className="text-lg sm:text-xl font-semibold">
                      {org.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-lg sm:text-xl truncate">{org.name}</h3>
                      <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                        <Activity className="w-3 h-3" />
                        {org.status}
                      </Badge>
                    </div>

                    <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      Créée le {org.createdAt}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{org.eventsCount} événements</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>{org.totalParticipants} participants</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        <span>{org.monthlyRevenue} ce mois</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/org/${org.id}`}>Gérer</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/dashboard/org/${org.id}/settings`}>
                      <Settings className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && organizations.length === 0 && (
        <EmptyState
          icon={<Building2 className="w-16 h-16" />}
          title="Aucune organisation créée"
          description="Créez votre première organisation pour commencer à organiser des événements"
          actionLabel="Créer ma première organisation"
          actionUrl="/dashboard/organizations/new"
        />
      )}
    </PageContainer>
  );
};

export default Organizations;
