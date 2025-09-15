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
  Activity,
  Clock
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Analytics = () => {
  const { orgId, eventId } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [registrationStats, setRegistrationStats] = useState<any[]>([]);
  const [ticketTypeStats, setTicketTypeStats] = useState<any[]>([]);
  const [dailyRegistrations, setDailyRegistrations] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!orgId || !eventId) return;
      
      try {
        // Récupérer les données de l'événement
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        // Compter les inscriptions
        const { count: totalRegistrationsCount } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId);

        // Calculer les revenus
        const { data: payments } = await supabase
          .from('payments')
          .select('amount_cents, orders!inner(*)')
          .eq('orders.event_id', eventId);

        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;

        // Récupérer les types de billets avec leurs stats
        const { data: ticketTypes } = await supabase
          .from('ticket_types')
          .select(`
            *,
            registrations (
              id,
              status
            )
          `)
          .eq('event_id', eventId);

        const ticketStats = ticketTypes?.map(ticket => {
          const sold = ticket.registrations?.filter((r: any) => r.status === 'issued').length || 0;
          return {
            name: ticket.name,
            sold,
            total: ticket.quantity,
            price: `${(ticket.price_cents / 100).toFixed(2)}€`,
            revenue: `${((sold * ticket.price_cents) / 100).toFixed(2)}€`
          };
        }) || [];

        // Récupérer les inscriptions récentes
        const { data: recentRegs } = await supabase
          .from('registrations')
          .select(`
            id,
            status,
            created_at,
            users (
              display_name,
              email
            ),
            ticket_types (
              name
            )
          `)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(10);

        const recentRegistrationsList = recentRegs?.map(reg => ({
          id: reg.id,
          name: reg.users?.display_name || 'Anonyme',
          email: reg.users?.email || 'email@example.com',
          ticketType: reg.ticket_types?.name || 'Standard',
          registrationDate: new Date(reg.created_at).toLocaleDateString('fr-FR'),
          status: reg.status === 'issued' ? 'Confirmé' : 'En attente'
        })) || [];

        // Générer des données quotidiennes simulées (à implémenter avec vraies données plus tard)
        const dailyData = [
          { date: "Lun", count: Math.floor(Math.random() * 10) + 5 },
          { date: "Mar", count: Math.floor(Math.random() * 10) + 5 },
          { date: "Mer", count: Math.floor(Math.random() * 10) + 5 },
          { date: "Jeu", count: Math.floor(Math.random() * 10) + 5 },
          { date: "Ven", count: Math.floor(Math.random() * 10) + 5 },
          { date: "Sam", count: Math.floor(Math.random() * 10) + 5 },
          { date: "Dim", count: Math.floor(Math.random() * 10) + 5 }
        ];

        setEventData({
          title: event.title,
          date: new Date(event.starts_at).toLocaleDateString('fr-FR'),
          status: event.status === 'published' ? 'Publié' : 'Brouillon',
          totalRegistrations: totalRegistrationsCount || 0,
          capacity: event.capacity || 0,
          revenue: `${(totalRevenue / 100).toFixed(2)}€`,
          views: Math.floor(Math.random() * 1000) + 500, // Simulé
          conversionRate: "12.5%" // Simulé
        });

        setRegistrationStats([
          {
            title: "Total inscriptions",
            value: (totalRegistrationsCount || 0).toString(),
            change: "+12 cette semaine",
            icon: Users,
            color: "text-blue-600"
          },
          {
            title: "Revenus générés",
            value: `${(totalRevenue / 100).toFixed(0)}€`,
            change: "+8% ce mois",
            icon: CreditCard,
            color: "text-green-600"
          },
          {
            title: "Taux de remplissage",
            value: `${Math.round(((totalRegistrationsCount || 0) / (event.capacity || 1)) * 100)}%`,
            change: "+3% cette semaine",
            icon: Activity,
            color: "text-purple-600"
          },
          {
            title: "Vues de l'événement",
            value: (Math.floor(Math.random() * 1000) + 500).toString(),
            change: "+15% ce mois",
            icon: Eye,
            color: "text-orange-600"
          }
        ]);

        setTicketTypeStats(ticketStats);
        setDailyRegistrations(dailyData);
        setRecentRegistrations(recentRegistrationsList);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [orgId, eventId]);

  // Fonction pour exporter le rapport
  const handleExportReport = async () => {
    if (!eventData) return;
    
    try {
      // Créer le contenu du rapport CSV
      const csvContent = [
        ['RAPPORT ANALYTIQUE - ' + eventData.title],
        ['Généré le:', new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR')],
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
          ticket.revenue
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

  if (loading) {
    return <div className="flex justify-center items-center py-12">Chargement...</div>;
  }

  if (!eventData) {
    return <div className="text-center py-12">Événement non trouvé</div>;
  }

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
                {eventData.capacity > 0 ? Math.round((eventData.totalRegistrations / eventData.capacity) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={eventData.capacity > 0 ? (eventData.totalRegistrations / eventData.capacity) * 100 : 0} 
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
                        {ticket.revenue} générés
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={ticket.total > 0 ? (ticket.sold / ticket.total) * 100 : 0} 
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
            {recentRegistrations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune inscription pour le moment
              </p>
            ) : (
              recentRegistrations.map((registration) => (
                <div key={registration.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{registration.name}</p>
                      <p className="text-sm text-muted-foreground">{registration.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {registration.ticketType}
                    </Badge>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {registration.registrationDate}
                    </p>
                    <p className={`text-xs ${registration.status === 'Confirmé' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {registration.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;