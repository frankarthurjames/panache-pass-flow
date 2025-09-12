import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Calendar, MapPin, Users, Trophy, Zap, Shield, Heart, ArrowRight, Play, CheckCircle, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 -z-10" />
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-8 text-sm font-medium px-4 py-2">
            🏆 Plateforme #1 en billetterie sportive
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Organisez vos événements{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              sportifs
            </span>{" "}
            en quelques clics
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            De la création à la vente de billets, gérez tout votre événement sur une seule plateforme moderne et intuitive.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button size="lg" asChild className="text-lg px-10 py-4 h-auto">
              <Link to="/auth?tab=signup">
                Créer mon événement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-lg px-6 py-4 h-auto group">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Voir la démo (2 min)
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10k+</div>
              <div className="text-sm text-muted-foreground">Événements créés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500k+</div>
              <div className="text-sm text-muted-foreground">Billets vendus</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction client</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6">Simple comme 1-2-3</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Lancez votre événement sportif en moins de 10 minutes
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Créez votre événement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ajoutez les détails de votre événement : date, lieu, description. Notre interface intuitive vous guide à chaque étape.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Configurez la billetterie</h3>
              <p className="text-muted-foreground leading-relaxed">
                Définissez vos tarifs, quotas et types de billets. Les paiements sont automatiquement sécurisés via Stripe.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Partagez et vendez</h3>
              <p className="text-muted-foreground leading-relaxed">
                Diffusez votre événement et suivez les ventes en temps réel depuis votre tableau de bord personnalisé.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button size="lg" asChild>
              <Link to="/auth?tab=signup">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des outils professionnels pour organiser des événements sportifs inoubliables
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Création ultra-rapide</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Notre assistant IA vous aide à créer votre événement en quelques minutes. 
                Templates pré-conçus pour tous types de sports.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Assistant IA pour la création
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Templates pour 20+ sports
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Import depuis Excel/CSV
                </li>
              </ul>
            </div>
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Paiements ultra-sécurisés</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Intégration native avec Stripe. Acceptez tous les modes de paiement, 
                gérez les remboursements automatiquement.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Certification PCI DSS
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Paiements en plusieurs fois
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Remboursements automatiques
                </li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Analytics en temps réel</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Suivez vos ventes, analysez vos performances et optimisez vos événements 
                grâce à notre tableau de bord avancé.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Dashboard temps réel
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Rapports détaillés
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  Export des données
                </li>
              </ul>
            </div>
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Événements populaires</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les événements qui cartonnent sur Panache Esport
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Tournoi de Tennis de Table Pro",
                date: "15 Jan 2025",
                price: "25€",
                location: "Paris, France",
                participants: "120/150",
                image: "bg-gradient-to-br from-orange-400 to-red-500"
              },
              {
                title: "Marathon International de Lyon",
                date: "22 Jan 2025", 
                price: "45€",
                location: "Lyon, France",
                participants: "890/1000",
                image: "bg-gradient-to-br from-blue-400 to-purple-500"
              },
              {
                title: "Championnat National Badminton",
                date: "28 Jan 2025",
                price: "30€",
                location: "Marseille, France", 
                participants: "64/80",
                image: "bg-gradient-to-br from-green-400 to-blue-500"
              }
            ].map((event, index) => (
              <Card key={index} className="group cursor-pointer overflow-hidden border-0 hover:shadow-xl transition-all duration-300">
                <div className={`aspect-[4/3] ${event.image} relative`}>
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-primary">{event.price}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">{event.title}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      {event.date}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      {event.participants} participants
                    </div>
                  </div>
                  <Button size="sm" className="w-full group-hover:bg-primary/90">
                    Réserver maintenant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/events">
                Explorer tous les événements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-primary to-primary/90">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Votre prochain événement commence ici
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Rejoignez plus de 5000 organisateurs qui ont choisi Panache Esport 
            pour créer des événements sportifs exceptionnels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-10 py-4 h-auto">
              <Link to="/auth?tab=signup">
                Créer mon événement gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="text-white/80 text-sm">
              ✨ Aucune carte bancaire requise
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
