import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  Download,
  Eye,
  UserCheck,
  Clock
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const { orgId, eventId } = useParams();

  // Fonction pour exporter le rapport
  const handleExportReport = async () => {
    try {
      // Récupérer les données de l'événement et des statistiques
      const reportData = {
        eventInfo: eventData,
        statistics: registrationStats,
        ticketPerformance: ticketTypeStats,
        dailyData: dailyRegistrations,
        recentRegistrations: recentRegistrations,
        exportDate: new Date().toLocaleDateString('fr-FR'),
        exportTime: new Date().toLocaleTimeString('fr-FR')
      };

      // Créer le contenu du rapport CSV
      const csvContent = [
        ['RAPPORT ANALYTIQUE - ' + eventData.title],
        ['Généré le:', reportData.exportDate + ' à ' + reportData.exportTime],
        [''],
        
        // Informations générales
        ['=== INFORMATIONS GÉNÉRALES ==='],
        ['Titre événement:', eventData.title],
        ['Date événement:', eventData.date],
        ['Statut:', eventData.status],
        ['Capacité:', eventData.capacity.toString()],
        [''],
        
        // Statistiques principales
        ['=== STATISTIQUES PRINCIPALES ==='],
        ...registrationStats.map(stat => [stat.title + ':', stat.value, stat.change]),
        [''],
        
        // Performance des billets
        ['=== PERFORMANCE PAR TYPE DE BILLET ==='],
        ['Type', 'Vendus', 'Total', 'Taux', 'Revenus'],
        ...ticketTypeStats.map(ticket => [
          ticket.name,
          ticket.sold.toString(),
          ticket.total.toString(),
          Math.round((ticket.sold / ticket.total) * 100) + '%',
          ticket.revenue + '€'
        ]),
        [''],
        
        // Inscriptions quotidiennes
        ['=== INSCRIPTIONS PAR JOUR ==='],
        ['Jour', 'Nombre d\'inscriptions'],
        ...dailyRegistrations.map(day => [day.date, day.count.toString()]),
        [''],
        
        // Inscriptions récentes
        ['=== INSCRIPTIONS RÉCENTES ==='],
        ['Nom', 'Email', 'Type de billet', 'Date', 'Statut'],
        ...recentRegistrations.map(reg => [
          reg.name,
          reg.email,
          reg.ticketType,
          reg.registrationDate,
          reg.status
        ])
      ];

      // Convertir en CSV
      const csvString = csvContent
        .map(row => Array.isArray(row) ? row.map(cell => `"${cell}"`).join(',') : `"${row}"`)
        .join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `rapport-analytics-${eventData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();

      toast.success("Rapport exporté avec succès!");
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error("Erreur lors de l'export du rapport");
    }
  };

  // Mock data - sera remplacé par des données réelles
  const eventData = {
    title: "Tournoi de Tennis Open 2025",
    date: "25 Jan 2025",
    status: "Publié",
    totalRegistrations: 45,
    capacity: 60,
    revenue: 1125,
    viewsCount: 324,
    conversionRate: 13.9
  };

  const registrationStats = [
    {
      title: "Total des inscriptions",
      value: "45",
      change: "+12 cette semaine",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Revenus générés",
      value: "1,125€",
      change: "+360€ cette semaine",
      icon: CreditCard,
      color: "text-green-600"
    },
    {
      title: "Vues de la page",
      value: "324",
      change: "+89 cette semaine",
      icon: Eye,
      color: "text-purple-600"
    },
    {
      title: "Taux de conversion",
      value: "13.9%",
      change: "+2.1% cette semaine",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  const ticketTypeStats = [
    {
      name: "Standard",
      sold: 30,
      total: 40,
      price: 25,
      revenue: 750
    },
    {
      name: "VIP",
      sold: 15,
      total: 20,
      price: 50,
      revenue: 750
    }
  ];

  const dailyRegistrations = [
    { date: "Lun", count: 3 },
    { date: "Mar", count: 7 },
    { date: "Mer", count: 5 },
    { date: "Jeu", count: 12 },
    { date: "Ven", count: 8 },
    { date: "Sam", count: 6 },
    { date: "Dim", count: 4 }
  ];

  const recentRegistrations = [
    {
      id: 1,
      name: "Marie Dupont",
      email: "marie.dupont@email.com",
      ticketType: "Standard",
      registrationDate: "Il y a 2h",
      status: "Confirmé"
    },
    {
      id: 2,
      name: "Jean Martin",
      email: "jean.martin@email.com", 
      ticketType: "VIP",
      registrationDate: "Il y a 5h",
      status: "Confirmé"
    },
    {
      id: 3,
      name: "Sophie Lemoine",
      email: "sophie.lemoine@email.com",
      ticketType: "Standard", 
      registrationDate: "Il y a 1j",
      status: "En attente"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/dashboard/org/${orgId}/events`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux événements
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Analyse de l'événement</h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">{eventData.title}</p>
            <Badge variant="secondary">{eventData.status}</Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {eventData.date}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="w-4 h-4 mr-2" />
          Exporter le rapport
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {registrationStats.map((stat) => (
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
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Capacity Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de remplissage</CardTitle>
          <CardDescription>
            Nombre d'inscriptions par rapport à la capacité maximale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {eventData.totalRegistrations} / {eventData.capacity} participants
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((eventData.totalRegistrations / eventData.capacity) * 100)}%
              </span>
            </div>
            <Progress 
              value={(eventData.totalRegistrations / eventData.capacity) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ticket Types & Daily Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Types Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par type de billet</CardTitle>
            <CardDescription>
              Répartition des ventes par catégorie de billet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketTypeStats.map((ticket) => (
                <div key={ticket.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ticket.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {ticket.sold}/{ticket.total} vendus
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ticket.revenue}€ générés
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={(ticket.sold / ticket.total) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Registrations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Inscriptions cette semaine</CardTitle>
            <CardDescription>
              Nombre d'inscriptions par jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyRegistrations.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-12">{day.date}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-muted h-6 rounded-sm relative overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-sm transition-all duration-300"
                        style={{ width: `${Math.min((day.count / 15) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {day.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Inscriptions récentes</CardTitle>
          <CardDescription>
            Les derniers participants inscrits à votre événement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRegistrations.map((registration) => (
              <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{registration.name}</p>
                    <p className="text-sm text-muted-foreground">{registration.email}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline">{registration.ticketType}</Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {registration.registrationDate}
                  </div>
                  <Badge 
                    variant={registration.status === "Confirmé" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {registration.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;