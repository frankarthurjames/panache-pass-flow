import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, Users, Trophy, Star, ArrowRight, Zap, Shield, Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 -z-10" />
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-sm font-medium">
            🏆 Plateforme de billetterie sportive
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Panache Esport
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            La plateforme de référence pour organiser et participer aux événements sportifs. 
            Créez, gérez et vendez vos billets en toute simplicité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/events">
                Découvrir les événements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link to="/auth?tab=signup">
                Créer un événement
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir Panache Esport ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une solution complète et moderne pour tous vos besoins en billetterie sportive
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Setup rapide</CardTitle>
                <CardDescription>
                  Créez votre événement en quelques clics et commencez à vendre immédiatement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Paiements sécurisés</CardTitle>
                <CardDescription>
                  Intégration Stripe complète avec gestion automatique des paiements et des remboursements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Expérience utilisateur</CardTitle>
                <CardDescription>
                  Interface intuitive et responsive pour une expérience d'achat optimale sur tous les appareils
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Gestion des participants</CardTitle>
                <CardDescription>
                  Suivez vos inscriptions, exportez les données et gérez vos participants facilement
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Analytics avancées</CardTitle>
                <CardDescription>
                  Dashboard complet avec statistiques détaillées sur vos ventes et performances
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Support dédié</CardTitle>
                <CardDescription>
                  Équipe support réactive et documentation complète pour vous accompagner
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Événements à venir
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les prochains événements sportifs près de chez vous
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Sample Event Cards */}
            {[
              {
                title: "Tournoi de Tennis de Table",
                date: "15 Jan 2025",
                location: "Paris, France",
                price: "25€",
                participants: "120/150"
              },
              {
                title: "Marathon de Lyon",
                date: "22 Jan 2025", 
                location: "Lyon, France",
                price: "45€",
                participants: "890/1000"
              },
              {
                title: "Championnat de Badminton",
                date: "28 Jan 2025",
                location: "Marseille, France", 
                price: "30€",
                participants: "64/80"
              }
            ].map((event, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20" />
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {event.participants}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">{event.price}</span>
                    <Button size="sm">Réserver</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/events">
                Voir tous les événements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à organiser votre premier événement ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des milliers d'organisateurs qui font confiance à Panache Esport 
            pour leurs événements sportifs
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
            <Link to="/auth?tab=signup">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
