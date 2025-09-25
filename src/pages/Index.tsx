import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { FeatureCard } from "@/components/FeatureCard";
import { SearchSection } from "@/components/SearchSection";
import { Footer } from "@/components/Footer";
import { ArrowRight, Zap, Shield, BarChart3, Search, Loader2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularEvents, setPopularEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    satisfaction: 98
  });
  const [loading, setLoading] = useState(true);

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickSearch();
    }
  };

  // Récupération des données réelles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer les événements populaires (3 derniers événements publiés)
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            organizations (
              id,
              name,
              logo_url
            ),
            registrations (
              id
            ),
            ticket_types (
              id,
              price_cents,
              currency
            )
          `)
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(3);

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
        } else {
          const formattedEvents = eventsData?.map(event => {
            const participantsCount = event.registrations?.length || 0;
            const minPrice = event.ticket_types?.length > 0 
              ? Math.min(...event.ticket_types.map((t: any) => t.price_cents))
              : 0;
            
            return {
              id: event.id,
              title: event.title,
              date: new Date(event.starts_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              price: minPrice > 0 ? `${(minPrice / 100).toFixed(0)}€` : 'Gratuit',
              location: event.city || 'Lieu à confirmer',
              participants: `${participantsCount}/${event.capacity || '∞'}`,
              image: event.images && Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop'
            };
          }) || [];

          setPopularEvents(formattedEvents);
        }

        // Récupérer les statistiques globales
        const { count: totalEvents } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        const { count: totalRegistrations } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalEvents: totalEvents || 0,
          totalTickets: totalRegistrations || 0,
          satisfaction: 98 // Garde cette valeur fixe pour l'instant
        });

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 -z-10" />
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-8 text-sm font-medium px-4 py-2">
            🏆 Plateforme de billetterie sportive
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
          {/* Recherche rapide */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="flex gap-2 bg-white rounded-lg p-2 shadow-lg border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher un événement sportif..."
                  className="pl-10 h-12 text-base border-0 focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button 
                size="lg" 
                onClick={handleQuickSearch}
                className="h-12 px-8 text-base"
              >
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button size="lg" asChild className="text-lg px-10 py-4 h-auto">
              <Link to="/auth?tab=signup">
                Créer mon événement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                ) : (
                  `${stats.totalEvents}+`
                )}
              </div>
              <div className="text-sm text-muted-foreground">Événements créés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                ) : (
                  `${stats.totalTickets}+`
                )}
              </div>
              <div className="text-sm text-muted-foreground">Billets vendus</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.satisfaction}%</div>
              <div className="text-sm text-muted-foreground">Satisfaction client</div>
            </div>
          </div>
        </div>
      </header>

      <main>
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
            description="Créez votre événement en quelques étapes grâce à notre formulaire guidé. Ajoutez vos billets, configurez les prix et publiez instantanément."
            features={[
              "Formulaire guidé étape par étape",
              "Gestion des types de billets",
              "Publication instantanée"
            ]}
          />

          <FeatureCard
            icon={<Shield className="h-8 w-8 text-primary" />}
            title="Paiements sécurisés"
            description="Intégration complète avec Stripe. Acceptez les paiements par carte, recevez vos fonds directement et gérez vos transactions."
            features={[
              "Intégration Stripe native",
              "Paiements par carte sécurisés",
              "Réception directe des fonds"
            ]}
            imagePosition="left"
          />

          <FeatureCard
            icon={<BarChart3 className="h-8 w-8 text-primary" />}
            title="Gestion simplifiée"
            description="Suivez vos événements et participants depuis votre tableau de bord. Validez les billets avec notre système QR intégré."
            features={[
              "Tableau de bord complet",
              "Validation QR des billets",
              "Gestion des participants"
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
            {loading ? (
              // Skeleton loading
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-muted rounded-lg p-6 animate-pulse">
                  <div className="w-full h-48 bg-muted-foreground/20 rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded mb-4 w-2/3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/3"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : popularEvents.length > 0 ? (
              popularEvents.map((event, index) => (
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
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun événement disponible</h3>
                  <p>Il n'y a actuellement aucun événement à afficher.</p>
                </div>
                <Button asChild>
                  <Link to="/events">Voir tous les événements</Link>
                </Button>
              </div>
            )}
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
              Rejoignez plus de 5000 organisateurs qui ont choisi Panache 
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
