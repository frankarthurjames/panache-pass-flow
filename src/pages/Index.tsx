import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { FeatureCard } from "@/components/FeatureCard";
import { SearchSection } from "@/components/SearchSection";
import { ArrowRight, Play, Zap, Shield, BarChart3 } from "lucide-react";

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

      {/* Search Section */}
      <SearchSection />

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
          
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Création ultra-rapide"
            description="Notre assistant IA vous aide à créer votre événement en quelques minutes. Templates pré-conçus pour tous types de sports."
            features={[
              "Assistant IA pour la création",
              "Templates pour 20+ sports", 
              "Import depuis Excel/CSV"
            ]}
          />

          <FeatureCard
            icon={<Shield className="h-8 w-8 text-primary" />}
            title="Paiements ultra-sécurisés"
            description="Intégration native avec Stripe. Acceptez tous les modes de paiement, gérez les remboursements automatiquement."
            features={[
              "Certification PCI DSS",
              "Paiements en plusieurs fois",
              "Remboursements automatiques"
            ]}
            imagePosition="left"
          />

          <FeatureCard
            icon={<BarChart3 className="h-8 w-8 text-primary" />}
            title="Analytics en temps réel"
            description="Suivez vos ventes, analysez vos performances et optimisez vos événements grâce à notre tableau de bord avancé."
            features={[
              "Dashboard temps réel",
              "Rapports détaillés", 
              "Export des données"
            ]}
          />
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
                id: 1,
                title: "Tournoi de Tennis de Table Pro",
                date: "15 Jan 2025",
                price: "25€",
                location: "Paris, France",
                participants: "120/150",
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop"
              },
              {
                id: 2,
                title: "Marathon International de Lyon",
                date: "22 Jan 2025", 
                price: "45€",
                location: "Lyon, France",
                participants: "890/1000",
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop"
              },
              {
                id: 3,
                title: "Championnat National Badminton",
                date: "28 Jan 2025",
                price: "30€",
                location: "Marseille, France", 
                participants: "64/80",
                image: "https://images.unsplash.com/photo-1606339812200-e2916e060c9d?w=500&h=400&fit=crop"
              }
            ].map((event, index) => (
              <EventCard
                key={index}
                id={event.id}
                title={event.title}
                date={event.date}
                price={event.price}
                location={event.location}
                participants={event.participants}
                image={event.image}
              />
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
