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
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-muted/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mb-2">Setup rapide</CardTitle>
                <CardDescription>
                  Créez votre événement en quelques clics et commencez à vendre immédiatement
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-muted/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="mb-2">Paiements sécurisés</CardTitle>
                <CardDescription>
                  Intégration Stripe complète avec gestion automatique des paiements et des remboursements
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-muted/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                  <Heart className="h-6 w-6 text-warning" />
                </div>
                <CardTitle className="mb-2">Expérience utilisateur</CardTitle>
                <CardDescription>
                  Interface intuitive et responsive pour une expérience d'achat optimale sur tous les appareils
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-muted/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="mb-2">Gestion des participants</CardTitle>
                <CardDescription>
                  Suivez vos inscriptions, exportez les données et gérez vos participants facilement
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-muted/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mb-2">Analytics avancées</CardTitle>
                <CardDescription>
                  Dashboard complet avec statistiques détaillées sur vos ventes et performances
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-muted/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                  <Star className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="mb-2">Support dédié</CardTitle>
                <CardDescription>
                  Équipe support réactive et documentation complète pour vous accompagner
                </CardDescription>
              </CardContent>
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
              <Card key={index} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary-glow/10 group-hover:from-primary/30 group-hover:to-primary-glow/20 transition-all duration-300" />
                <CardContent className="p-6">
                  <CardTitle className="mb-4 text-lg">{event.title}</CardTitle>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {event.date}
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-lg px-3 py-1">
                        {event.price}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {event.participants}
                    </div>
                  </div>
                  <Button className="w-full group-hover:bg-primary-glow transition-colors">
                    Réserver maintenant
                  </Button>
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
