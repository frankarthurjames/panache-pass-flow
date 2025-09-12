import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Euro, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  Info
} from "lucide-react";

const EventDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Données d'exemple - à remplacer par des données réelles
  const event = {
    id: 1,
    title: "Tournoi de Tennis de Table Pro",
    date: "15 Janvier 2025",
    time: "14:00",
    price: "25€",
    location: "Paris, France",
    address: "123 Avenue des Sports, 75012 Paris",
    venue: "Gymnase Jean Moulin",
    participants: "120/150",
    status: "Disponible",
    description: "Un tournoi de tennis de table professionnel qui réunit les meilleurs joueurs de la région parisienne. Venez assister à des matchs de haut niveau dans une ambiance conviviale.",
    longDescription: "Ce tournoi de tennis de table est l'un des événements phares de la saison sportive parisienne. Organisé dans le magnifique gymnase Jean Moulin, il accueille chaque année plus de 150 participants venus de toute la France.\n\nL'événement se déroule sur une journée complète avec différentes catégories : débutants, intermédiaires et experts. Que vous soyez spectateur ou participant, vous vivrez des moments intenses remplis d'émotions sportives.\n\nDes prix exceptionnels sont à gagner, notamment un voyage sportif d'une semaine pour le vainqueur de la catégorie expert.",
    organizer: "Club Sportif Parisien",
    category: "Tennis de Table",
    level: "Tous niveaux",
    ageLimit: "16+",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606339812200-e2916e060c9d?w=800&h=600&fit=crop"
    ],
    ticketTypes: [
      { name: "Standard", price: "25€", description: "Accès complet à l'événement" },
      { name: "VIP", price: "45€", description: "Accès VIP + repas inclus" }
    ]
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header with back button */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 border-b">
        <div className="container mx-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux événements
            </Link>
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Carousel */}
            <div className="relative">
              <div className="aspect-[16/10] bg-muted rounded-2xl overflow-hidden relative group">
                <img 
                  src={event.images[currentImageIndex]} 
                  alt={`${event.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows */}
                {event.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
                
                {/* Image indicators */}
                {event.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {event.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Thumbnail strip */}
              {event.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                  {event.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 aspect-video w-24 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{event.category}</Badge>
                  <Badge variant={event.status === 'Disponible' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Event Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{event.date}</div>
                    <div className="text-muted-foreground">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{event.venue}</div>
                    <div className="text-muted-foreground">{event.location}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{event.participants}</div>
                    <div className="text-muted-foreground">participants</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Trophy className="w-4 h-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{event.level}</div>
                    <div className="text-muted-foreground">{event.ageLimit}</div>
                  </div>
                </div>
              </div>

              {/* Long Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    À propos de cet événement
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    {event.longDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="w-4 h-4 mr-2" />
                      Organisé par <span className="font-medium ml-1">{event.organizer}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Booking Card */}
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-bold">{event.price}</div>
                    <div className="text-sm text-muted-foreground">par personne</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                </div>

                {/* Ticket Types */}
                <div className="space-y-3 mb-6">
                  {event.ticketTypes.map((ticket, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{ticket.name}</div>
                        <div className="text-sm text-muted-foreground">{ticket.description}</div>
                      </div>
                      <div className="font-bold">{ticket.price}</div>
                    </div>
                  ))}
                </div>

                <Button size="lg" className="w-full mb-4">
                  Réserver maintenant
                </Button>
                
                <Button variant="outline" size="lg" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>

                {/* Location */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Lieu de l'événement</h4>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">{event.venue}</div>
                    <div className="text-muted-foreground">{event.address}</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    Voir sur la carte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;