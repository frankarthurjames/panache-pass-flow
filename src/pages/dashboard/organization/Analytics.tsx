import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  CreditCard, 
  Target,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Analytics = () => {
  const { orgId } = useParams();

  // Mock data - sera remplacé par des données réelles
  const stats = [
    {
      title: "Revenus total",
      value: "12,450€",
      change: "+23%",
      changeType: "increase",
      period: "vs mois dernier",
      icon: CreditCard,
    },
    {
      title: "Participants total",
      value: "247",
      change: "+18%", 
      changeType: "increase",
      period: "vs mois dernier",
      icon: Users,
    },
    {
      title: "Événements organisés",
      value: "12",
      change: "0%",
      changeType: "neutral",
      period: "vs mois dernier", 
      icon: Calendar,
    },
    {
      title: "Taux de remplissage",
      value: "78%",
      change: "-5%",
      changeType: "decrease", 
      period: "vs mois dernier",
      icon: Target,
    },
  ];

  const topEvents = [
    {
      name: "Tournoi Tennis Open 2025",
      participants: 45,
      capacity: 60,
      revenue: "1,125€",
      fillRate: "75%"
    },
    {
      name: "Course à Pied Solidaire", 
      participants: 89,
      capacity: 100,
      revenue: "1,335€",
      fillRate: "89%"
    },
    {
      name: "Championnat Badminton Local",
      participants: 32,
      capacity: 40, 
      revenue: "960€",
      fillRate: "80%"
    }
  ];

  const monthlyData = [
    { month: "Juillet", events: 3, participants: 67, revenue: "1,980€" },
    { month: "Août", events: 2, participants: 45, revenue: "1,350€" },
    { month: "Septembre", events: 4, participants: 89, revenue: "2,670€" },
    { month: "Octobre", events: 3, participants: 56, revenue: "1,680€" },
    { month: "Novembre", events: 0, participants: 0, revenue: "0€" },
    { month: "Décembre", events: 1, participants: 23, revenue: "690€" }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case "decrease":
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return "text-green-600";
      case "decrease":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Statistiques</h1>
          <p className="text-muted-foreground">
            Analysez les performances de vos événements
          </p>
        </div>
        <Select defaultValue="last-6-months">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-30-days">30 derniers jours</SelectItem>
            <SelectItem value="last-3-months">3 derniers mois</SelectItem>
            <SelectItem value="last-6-months">6 derniers mois</SelectItem>
            <SelectItem value="last-year">Dernière année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="flex items-center gap-1">
                {getChangeIcon(stat.changeType)}
                <span className={`text-xs font-medium ${getChangeColor(stat.changeType)}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.period}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle>Événements les plus performants</CardTitle>
            <CardDescription>
              Classement par taux de remplissage des 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{event.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.participants}/{event.capacity} participants
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-semibold">{event.revenue}</div>
                  <Badge variant={
                    parseInt(event.fillRate) > 80 ? "default" : 
                    parseInt(event.fillRate) > 60 ? "secondary" : "outline"
                  }>
                    {event.fillRate}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance mensuelle</CardTitle>
            <CardDescription>
              Évolution de vos événements sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="font-medium">{data.month}</div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{data.events}</div>
                    <div className="text-muted-foreground">événements</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{data.participants}</div>
                    <div className="text-muted-foreground">participants</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{data.revenue}</div>
                    <div className="text-muted-foreground">revenus</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insights et recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">Excellente performance</h4>
                <p className="text-sm text-green-700">
                  Vos événements de course à pied ont un taux de remplissage de 89% en moyenne, 
                  considérez organiser plus d'événements dans cette catégorie.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Opportunité d'amélioration</h4>
                <p className="text-sm text-blue-700">
                  Le mois de novembre n'a pas eu d'événements. Planifiez vos événements 
                  à l'avance pour maintenir un rythme régulier.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Conseil marketing</h4>
                <p className="text-sm text-yellow-700">
                  Vos revenus augmentent mais le taux de remplissage baisse légèrement. 
                  Concentrez-vous sur la promotion pour maximiser la participation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;