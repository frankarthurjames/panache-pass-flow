import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Calendar, Users, TrendingUp, Eye, Edit, MoreHorizontal, Euro } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { user } = useAuth();

  const userEvents = [
    {
      id: 1,
      title: "Mon Tournoi de Tennis",
      date: "25 Jan 2025",
      status: "Publié",
      participants: "45/60",
      revenue: "1,125€",
      statusColor: "bg-green-500"
    },
    {
      id: 2,
      title: "Course à Pied Solidaire",
      date: "15 Fév 2025",
      status: "Brouillon",
      participants: "0/100",
      revenue: "0€",
      statusColor: "bg-yellow-500"
    },
    {
      id: 3,
      title: "Championnat Badminton Local",
      date: "8 Mar 2025",
      status: "En attente",
      participants: "12/40",
      revenue: "360€",
      statusColor: "bg-blue-500"
    }
  ];

  const stats = [
    {
      title: "Événements créés",
      value: "3",
      change: "+1 ce mois",
      icon: Calendar,
    },
    {
      title: "Total participants",
      value: "57",
      change: "+12 cette semaine",
      icon: Users,
    },
    {
      title: "Revenus générés",
      value: "1,485€",
      change: "+280€ ce mois",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bonjour, {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Organisateur'} 👋
              </h1>
              <p className="text-muted-foreground">
                Gérez vos événements et suivez vos performances depuis votre tableau de bord
              </p>
            </div>
            <Button size="lg" asChild>
              <Link to="/dashboard/events/new">
                <Plus className="w-5 h-5 mr-2" />
                Créer un événement
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
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
        </div>
      </section>

      {/* Events List */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Mes événements</h2>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </div>
          
          <div className="grid gap-6">
            {userEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${event.statusColor}`} />
                            {event.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.participants}
                            </span>
                            <span className="flex items-center gap-1">
                              <Euro className="w-4 h-4" />
                              {event.revenue}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                <Link to="/dashboard/events/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier événement
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;