import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { SearchSection } from "@/components/SearchSection";
import { FilterDialog } from "@/components/FilterDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

interface Filters {
  sport?: string;
  location?: string;
  priceMin?: string;
  priceMax?: string;
  date?: string;
}

const Events = () => {
  const [filters, setFilters] = useState<Filters>({});
  
  const allEvents = [
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
    },
    {
      id: 4,
      title: "Coupe de France Cyclisme",
      date: "5 Fév 2025",
      price: "35€",
      location: "Nice, France",
      participants: "200/250",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop"
    },
    {
      id: 5,
      title: "Tournoi Basketball 3x3",
      date: "12 Fév 2025",
      price: "20€",
      location: "Bordeaux, France",
      participants: "48/64",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=400&fit=crop"
    },
    {
      id: 6,
      title: "Semi-Marathon de Strasbourg",
      date: "19 Fév 2025",
      price: "40€",
      location: "Strasbourg, France",
      participants: "650/800",
      image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500&h=400&fit=crop"
    }
  ];

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // Filter by sport
      if (filters.sport) {
        const sportKeywords = {
          tennis: ['tennis'],
          marathon: ['marathon'],
          badminton: ['badminton'],
          cyclisme: ['cyclisme'],
          basketball: ['basketball']
        };
        const keywords = sportKeywords[filters.sport] || [];
        if (!keywords.some(keyword => event.title.toLowerCase().includes(keyword))) {
          return false;
        }
      }

      // Filter by location
      if (filters.location) {
        if (!event.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Filter by price
      const eventPrice = parseInt(event.price.replace('€', ''));
      if (filters.priceMin && eventPrice < parseInt(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && eventPrice > parseInt(filters.priceMax)) {
        return false;
      }

      return true;
    });
  }, [allEvents, filters]);

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
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
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
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              Charger plus d'événements
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;