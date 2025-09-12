import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { SearchSection } from "@/components/SearchSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Calendar, MapPin } from "lucide-react";

const Events = () => {
  const events = [
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-transparent to-primary/5">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-sm font-medium px-4 py-2">
            🎯 Tous les événements sportifs
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Découvrez les meilleurs{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              événements sportifs
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Participez aux tournois et compétitions près de chez vous. 
            Plus de 500 événements disponibles partout en France.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <SearchSection />

      {/* Filters & Stats */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">156 événements</span> trouvés
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
            {events.map((event, index) => (
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