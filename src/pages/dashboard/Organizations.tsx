import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Calendar, TrendingUp, Activity, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Organizations = () => {
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
      lastActivity: "Il y a 2h",
      createdAt: "15 Jan 2025"
    },
    {
      id: "2", 
      name: "Tennis Academy",
      logo: null,
      eventsCount: 8,
      totalParticipants: 89,
      monthlyRevenue: "1,680€",
      status: "Actif",
      lastActivity: "Il y a 1 jour",
      createdAt: "22 Déc 2024"
    }
  ];

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
        {organizations.map((org) => (
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