import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { SearchSection } from "@/components/SearchSection";
import { FilterDialog } from "@/components/FilterDialog";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Filters {
  sport?: string;
  location?: string;
  priceMin?: string;
  priceMax?: string;
  date?: string;
  keyword?: string;
}

const Events = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});
  const [urlFilters, setUrlFilters] = useState<Filters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayedEvents, setDisplayedEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 6;

  // Récupération des événements depuis Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Récupérer les événements publiés avec les organisations et les inscriptions
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
          .gte('starts_at', new Date().toISOString()) // Seulement les événements futurs
          .order('starts_at', { ascending: true });

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          setError("Erreur lors du chargement des événements");
          return;
        }

        // Transformer les données pour correspondre au format attendu
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
            venue: event.venue,
            participants: `${participantsCount}/${event.capacity || '∞'}`,
            image: event.images && Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop',
            description: event.description,
            starts_at: event.starts_at,
            ends_at: event.ends_at,
            organization: event.organizations?.name || 'Organisation'
          };
        }) || [];

        setAllEvents(formattedEvents);
      } catch (err) {
        console.error('Error:', err);
        setError("Erreur lors du chargement des événements");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    // Combiner les filtres de l'URL et les filtres manuels
    const combinedFilters = { ...urlFilters, ...filters };
    
    return allEvents.filter(event => {
      // Filter by sport
      if (combinedFilters.sport) {
        const sportKeywords = {
          tennis: ['tennis'],
          marathon: ['marathon'],
          badminton: ['badminton'],
          cyclisme: ['cyclisme'],
          basketball: ['basketball'],
          running: ['marathon', 'course', 'running'],
          football: ['football'],
          'tennis-table': ['tennis de table', 'ping-pong']
        };
        const keywords = sportKeywords[combinedFilters.sport] || [];
        if (!keywords.some(keyword => event.title.toLowerCase().includes(keyword))) {
          return false;
        }
      }

      // Filter by location/region
      if (combinedFilters.location) {
        const regionKeywords = {
          'ile-de-france': ['paris', 'ile-de-france'],
          'auvergne-rhone-alpes': ['lyon', 'auvergne', 'rhône-alpes'],
          'paca': ['marseille', 'nice', 'provence', 'côte d\'azur'],
          'nouvelle-aquitaine': ['bordeaux', 'nouvelle-aquitaine'],
          'occitanie': ['toulouse', 'montpellier', 'occitanie'],
          'hauts-de-france': ['lille', 'hauts-de-france'],
          'grand-est': ['strasbourg', 'nancy', 'grand est'],
          'pays-de-la-loire': ['nantes', 'pays de la loire']
        };
        const keywords = regionKeywords[combinedFilters.location] || [combinedFilters.location];
        if (!keywords.some(keyword => event.location.toLowerCase().includes(keyword))) {
          return false;
        }
      }

      // Filter by keyword
      if (combinedFilters.keyword) {
        const keyword = combinedFilters.keyword.toLowerCase();
        if (!event.title.toLowerCase().includes(keyword) && 
            !event.location.toLowerCase().includes(keyword)) {
          return false;
        }
      }

      // Filter by price
      const eventPrice = parseInt(event.price.replace('€', ''));
      if (combinedFilters.priceMin && eventPrice < parseInt(combinedFilters.priceMin)) {
        return false;
      }
      if (combinedFilters.priceMax && eventPrice > parseInt(combinedFilters.priceMax)) {
        return false;
      }

      return true;
    });
  }, [allEvents, filters, urlFilters]);

  // Lire les paramètres de l'URL au chargement
  useEffect(() => {
    const newFilters: Filters = {};
    
    const sport = searchParams.get('sport');
    const region = searchParams.get('region');
    const keyword = searchParams.get('q');
    
    if (sport) newFilters.sport = sport;
    if (region) newFilters.location = region;
    if (keyword) newFilters.keyword = keyword;
    
    setUrlFilters(newFilters);
    setCurrentPage(1);
    setDisplayedEvents([]);
  }, [searchParams]);

  // Fonction pour charger plus d'événements
  const loadMoreEvents = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      // Simuler un délai de chargement
      setTimeout(() => {
        const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newEvents = filteredEvents.slice(startIndex, endIndex);
        
        if (newEvents.length === 0) {
          setHasMore(false);
        } else {
          setDisplayedEvents(prev => [...prev, ...newEvents]);
        }
        
        setIsLoadingMore(false);
      }, 500);
    }
  };

  // Intersection Observer pour l'infinit scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreEvents();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const loadMoreElement = document.getElementById('load-more-trigger');
    if (loadMoreElement) {
      observer.observe(loadMoreElement);
    }

    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement);
      }
    };
  }, [hasMore, isLoadingMore, currentPage, filteredEvents.length]);

  // Initialiser les événements affichés
  useEffect(() => {
    const startIndex = 0;
    const endIndex = ITEMS_PER_PAGE;
    const initialEvents = filteredEvents.slice(startIndex, endIndex);
    setDisplayedEvents(initialEvents);
    setHasMore(filteredEvents.length > ITEMS_PER_PAGE);
    setCurrentPage(1);
  }, [filteredEvents]);

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des événements...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      

      {/* Search Section */}
      <SearchSection />

      {/* Filters & Stats */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <FilterDialog onFiltersChange={setFilters} />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{filteredEvents.length} événements</span> trouvés
                {displayedEvents.length < filteredEvents.length && (
                  <span className="ml-2 text-xs">({displayedEvents.length} affichés)</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Cette semaine: 24 événements
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                Près de vous: 8 événements
              </div>
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          {(urlFilters.sport || urlFilters.location || urlFilters.keyword) && (
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Filtres actifs:</span>
              {urlFilters.sport && urlFilters.sport !== 'tous' && (
                <Badge variant="secondary" className="text-xs">
                  Sport: {urlFilters.sport}
                </Badge>
              )}
              {urlFilters.location && urlFilters.location !== 'toutes' && (
                <Badge variant="secondary" className="text-xs">
                  Région: {urlFilters.location}
                </Badge>
              )}
              {urlFilters.keyword && (
                <Badge variant="secondary" className="text-xs">
                  Mot-clé: {urlFilters.keyword}
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {displayedEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aucun événement trouvé</h3>
              <p className="text-muted-foreground mb-6">
                {allEvents.length === 0 
                  ? "Il n'y a actuellement aucun événement disponible."
                  : "Aucun événement ne correspond à vos critères de recherche."
                }
              </p>
              {allEvents.length === 0 ? (
                <Button asChild>
                  <a href="/dashboard/organizations">Créer un événement</a>
                </Button>
              ) : (
                <Button variant="outline" onClick={() => {
                  setFilters({});
                  setUrlFilters({});
                }}>
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedEvents.map((event, index) => (
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
          )}
          
          {/* Infinit scrolling - Élément de déclenchement invisible */}
          {hasMore && (
            <div id="load-more-trigger" className="h-10 flex items-center justify-center mt-8">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span>Chargement automatique...</span>
                </div>
              )}
            </div>
          )}
          
          {/* Indicateur de fin */}
          {!hasMore && displayedEvents.length > 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p>Tous les événements ont été chargés</p>
            </div>
          )}
          
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Events;