import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Building2, Users, Calendar, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Overview = () => {
  const { user } = useAuth();

  // Mock data - sera remplacé par des données réelles
  const organizations = [
    {
      id: "1",
      name: "SportClub Lyon",
      logo: null,
      eventsCount: 12,
      totalParticipants: 156,
      monthlyRevenue: "2,450€",
      status: "Actif",
      lastActivity: "Il y a 2h"
    },
    {
      id: "2", 
      name: "Tennis Academy",
      logo: null,
      eventsCount: 8,
      totalParticipants: 89,
      monthlyRevenue: "1,680€",
      status: "Actif",
      lastActivity: "Il y a 1 jour"
    }
  ];

  const globalStats = [
    {
      title: "Organisations actives",
      value: "2",
      change: "+1 ce mois",
      icon: Building2,
    },
    {
      title: "Événements total",
      value: "20",
      change: "+5 cette semaine",
      icon: Calendar,
    },
    {
      title: "Participants total",
      value: "245",
      change: "+32 ce mois",
      icon: Users,
    },
    {
      title: "Revenus total",
      value: "4,130€",
      change: "+890€ ce mois",
      icon: TrendingUp,
    },
  ];

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
        <Button size="lg" asChild>
          <Link to="/dashboard/organizations/new">
            <Plus className="w-5 h-5 mr-2" />
            Créer une organisation
          </Link>
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
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
          {organizations.map((org) => (
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