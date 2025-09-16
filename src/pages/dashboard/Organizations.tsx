import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Calendar, TrendingUp, Activity, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Organizations = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return;
      
      try {
        // Récupérer les organisations où l'utilisateur est membre
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
          // Pour chaque organisation, récupérer les statistiques
          const orgsWithStats = await Promise.all(
            validMembers.map(async (member: any) => {
              const org = member.organizations;
              
              // Compter les événements
              const { count: eventsCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', org.id);

              // Compter les participants
              const { count: participantsCount } = await supabase
                .from('registrations')
                .select('*, events!inner(*)')
                .eq('events.organization_id', org.id);

              // Calculer les revenus du mois
              const startOfMonth = new Date();
              startOfMonth.setDate(1);
              const { data: payments } = await supabase
                .from('payments')
                .select('amount_cents, orders!inner(*, events!inner(*))')
                .eq('orders.events.organization_id', org.id)
                .gte('created_at', startOfMonth.toISOString());

              const monthlyRevenue = payments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;

              return {
                id: org.id,
                name: org.name,
                logo: org.logo_url,
                eventsCount: eventsCount || 0,
                totalParticipants: participantsCount || 0,
                monthlyRevenue: `${(monthlyRevenue / 100).toFixed(0)}€`,
                status: "Actif",
                lastActivity: "Il y a 2h", // À implémenter plus tard
                createdAt: new Date(org.created_at).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes organisations</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos organisations depuis cette page
          </p>
        </div>
        <Button size="lg" asChild>
          <Link to="/dashboard/organizations/new">
            <Plus className="w-5 h-5 mr-2" />
            Créer une organisation
          </Link>
        </Button>
      </div>

      {/* Organizations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={org.logo || ""} />
                    <AvatarFallback className="text-xl font-semibold">
                      {org.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-xl">{org.name}</h3>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {org.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      Créée le {org.createdAt} • {org.lastActivity}
                    </div>
                    
                    <div className="flex items-center gap-8 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{org.eventsCount} événements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{org.totalParticipants} participants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span>{org.monthlyRevenue} ce mois</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/org/${org.id}`}>
                      Gérer
                    </Link>
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
  );
};

export default Organizations;