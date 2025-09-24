import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  Info,
  Copy,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Récupération des données de l'événement
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("ID d'événement manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Récupérer l'événement avec l'organisation
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            *,
            organizations (
              id,
              name,
              logo_url
            )
          `)
          .eq('id', id)
          .eq('status', 'published')
          .single();

        if (eventError) {
          console.error('Error fetching event:', eventError);
          setError("Événement non trouvé");
          return;
        }

        if (!eventData) {
          setError("Événement non trouvé");
          return;
        }

        setEvent(eventData);

        // Récupérer les types de tickets
        const { data: ticketTypesData, error: ticketTypesError } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', id)
          .order('price_cents', { ascending: true });

        if (ticketTypesError) {
          console.error('Error fetching ticket types:', ticketTypesError);
        } else {
          setTicketTypes(ticketTypesData || []);
        }

        // Récupérer les inscriptions pour calculer le nombre de participants
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', id);

        if (registrationsError) {
          console.error('Error fetching registrations:', registrationsError);
        } else {
          setRegistrations(registrationsData || []);
        }

      } catch (err) {
        console.error('Error:', err);
        setError("Erreur lors du chargement de l'événement");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Métadonnées SEO
  useEffect(() => {
    if (!event) return;

    const title = `${event.title} - ${new Date(event.starts_at).toLocaleDateString('fr-FR')} | Panache`;
    const description = event.description || `Découvrez ${event.title} le ${new Date(event.starts_at).toLocaleDateString('fr-FR')} à ${event.venue || event.city}`;
    const url = window.location.href;
    const image = event.images && event.images.length > 0 ? event.images[0] : '';

    // Mise à jour du titre de la page
    document.title = title;

    // Métadonnées Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');

    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDescription) ogDescription.setAttribute('content', description);
    if (ogImage) ogImage.setAttribute('content', image);
    if (ogUrl) ogUrl.setAttribute('content', url);

    // Métadonnées Twitter
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');

    if (twitterTitle) twitterTitle.setAttribute('content', title);
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    if (twitterImage) twitterImage.setAttribute('content', image);

    // Description meta
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description);
  }, [event]);

  // Fonctions utilitaires pour formater les données
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (priceCents: number) => {
    return `${(priceCents / 100).toFixed(0)}€`;
  };

  const getParticipantsCount = () => {
    // Calculer le nombre total de tickets vendus (pas juste le nombre de registrations)
    return registrations.reduce((total, registration) => {
      // Chaque registration correspond à 1 ticket vendu
      return total + 1;
    }, 0);
  };

  const getTicketSoldCount = (ticketTypeId: string) => {
    // Compter le nombre de tickets vendus pour ce type de ticket spécifique
    return registrations.filter(registration => registration.ticket_type_id === ticketTypeId).length;
  };

  const getAvailableTickets = (ticketType: any) => {
    const soldCount = getTicketSoldCount(ticketType.id);
    return Math.max(0, ticketType.quantity - soldCount);
  };

  const getStatus = () => {
    if (!event) return 'Chargement...';
    const now = new Date();
    const startDate = new Date(event.starts_at);
    const endDate = new Date(event.ends_at);
    
    if (now < startDate) return 'À venir';
    if (now >= startDate && now <= endDate) return 'En cours';
    return 'Terminé';
  };

  const isEventFull = () => {
    if (!event || !event.capacity) return false;
    return getParticipantsCount() >= event.capacity;
  };

  const nextImage = () => {
    if (event?.images && event.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event?.images && event.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };

  // Fonctions de partage
  const shareUrl = window.location.href;
  const shareText = event ? `Découvrez cet événement : ${event.title} - ${formatDate(event.starts_at)} à ${event.venue || event.city}` : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié dans le presse-papiers !");
    } catch (err) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareByEmail = () => {
    if (!event) return;
    const subject = `Invitation à l'événement : ${event.title}`;
    const body = `Bonjour,\n\nJe vous invite à découvrir cet événement :\n\n${event.title}\n${formatDate(event.starts_at)} à ${formatTime(event.starts_at)}\n${event.venue || event.city}\n\n${event.description || ''}\n\nPlus d'informations : ${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Fonctions de gestion des tickets
  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }));
  };

  const getSubtotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === ticketId);
      return total + (ticket ? ticket.price_cents * quantity : 0);
    }, 0);
  };

  const getPlatformFees = () => {
    const totalTickets = getTotalTickets();
    const subtotal = getSubtotalPrice();
    const platformFeePerTicket = 50; // 0,50€ en centimes
    const platformFeePercentage = 0.02; // 2%
    const platformFeeFixed = totalTickets * platformFeePerTicket;
    const platformFeePercentageAmount = Math.round(subtotal * platformFeePercentage);
    return platformFeeFixed + platformFeePercentageAmount;
  };

  const getTotalPrice = () => {
    return getSubtotalPrice() + getPlatformFees();
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handleCheckout = async () => {
    if (getTotalTickets() === 0) {
      toast.error("Veuillez sélectionner au moins un ticket");
      return;
    }

    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Vous devez être connecté pour réserver des tickets");
      navigate('/auth?tab=signin');
      return;
    }

    try {
      setCheckoutLoading(true);

      // Préparer les données pour la session Stripe
      const lineItems = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketId, quantity]) => {
          const ticket = ticketTypes.find(t => t.id === ticketId);
          return {
            ticket_type_id: ticketId,
            quantity: quantity,
            unit_price_cents: ticket?.price_cents || 0
          };
        });

      console.log('Sending payment request:', {
        eventId: event.id,
        lineItems: lineItems,
        user: user.id
      });

      // Appeler la fonction Supabase pour créer la session de paiement
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return;
      }

      const response = await fetch(`https://wlxbydzshqijlfejqafp.supabase.co/functions/v1/create-payment-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          eventId: event.id,
          lineItems: lineItems
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de la session de paiement');
      }

      const data = result;

      if (data?.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error("Erreur lors de la création de la session de paiement");
      }

    } catch (err) {
      console.error('Error during checkout:', err);
      toast.error("Erreur lors du processus de paiement");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement de l'événement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Événement non trouvé</h1>
              <p className="text-muted-foreground mb-6">{error || "Cet événement n'existe pas ou n'est plus disponible."}</p>
              <Button asChild>
                <Link to="/events">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux événements
                </Link>
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
                {event.images && event.images.length > 0 ? (
                  <img 
                    src={event.images[currentImageIndex]} 
                    alt={`${event.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2" />
                      <p>Aucune image disponible</p>
                    </div>
                  </div>
                )}
                
                {/* Navigation arrows */}
                {event.images && event.images.length > 1 && (
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
                {event.images && event.images.length > 1 && (
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
              {event.images && event.images.length > 1 && (
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
                  <Badge variant="secondary">{event.organizations?.name || 'Organisation'}</Badge>
                  <Badge variant={getStatus() === 'À venir' ? 'default' : getStatus() === 'En cours' ? 'secondary' : 'outline'}>
                    {getStatus()}
                  </Badge>
                  {isEventFull() && (
                    <Badge variant="destructive">
                      COMPLET
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {event.description || 'Aucune description disponible.'}
                </p>
              </div>

              {/* Event Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{formatDate(event.starts_at)}</div>
                    <div className="text-muted-foreground">{formatTime(event.starts_at)}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{event.venue || 'Lieu à confirmer'}</div>
                    <div className="text-muted-foreground">{event.city || 'Ville non spécifiée'}</div>
                  </div>
                </div>
                <div className={`flex items-center text-sm ${isEventFull() ? 'text-red-600' : ''}`}>
                  <Users className={`w-4 h-4 mr-2 ${isEventFull() ? 'text-red-600' : 'text-primary'}`} />
                  <div>
                    <div className={`font-medium ${isEventFull() ? 'text-red-600' : ''}`}>
                      {getParticipantsCount()}/{event.capacity || '∞'}
                      {isEventFull() && ' - COMPLET'}
                    </div>
                    <div className="text-muted-foreground">participants</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">Fin</div>
                    <div className="text-muted-foreground">{formatTime(event.ends_at)}</div>
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
                    {event.description ? (
                      event.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Aucune description détaillée disponible.</p>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="w-4 h-4 mr-2" />
                      Organisé par <span className="font-medium ml-1">{event.organizations?.name || 'Organisation'}</span>
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
                    <div className="text-2xl font-bold">
                      {ticketTypes.length > 0 
                        ? formatPrice(Math.min(...ticketTypes.map(t => t.price_cents)))
                        : 'Gratuit'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ticketTypes.length > 1 ? 'à partir de' : ''} par personne
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                </div>

                {/* Ticket Selection */}
                {ticketTypes.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium mb-3">Sélectionnez vos tickets</h4>
                    {ticketTypes.map((ticket, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{ticket.name}</div>
                           <div className="text-sm text-muted-foreground">
                             {(() => {
                               const available = getAvailableTickets(ticket);
                               return available > 0 
                                 ? `${available} places disponibles` 
                                 : 'Complet';
                             })()}
                           </div>
                          <div className="text-lg font-bold mt-1">{formatPrice(ticket.price_cents)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTicketQuantity(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                            disabled={!selectedTickets[ticket.id] || selectedTickets[ticket.id] <= 0}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">
                            {selectedTickets[ticket.id] || 0}
                          </span>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => updateTicketQuantity(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                             disabled={getAvailableTickets(ticket) <= 0 || (selectedTickets[ticket.id] || 0) >= getAvailableTickets(ticket)}
                           >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Résumé du panier */}
                    {getTotalTickets() > 0 && (
                      <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {getTotalTickets()} ticket{getTotalTickets() > 1 ? 's' : ''}
                          </span>
                          <span className="font-medium">
                            {formatPrice(getSubtotalPrice())}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>Frais de plateforme (2% + 0,50€/billet)</span>
                          <span>{formatPrice(getPlatformFees())}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between items-center">
                          <span className="font-semibold">Total</span>
                          <span className="text-lg font-bold">
                            {formatPrice(getTotalPrice())}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p>Aucun ticket disponible pour cet événement</p>
                  </div>
                )}

                <Button 
                  size="lg" 
                  className="w-full mb-4"
                  onClick={handleCheckout}
                  disabled={getTotalTickets() === 0 || checkoutLoading || isEventFull()}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : isEventFull() ? (
                    'Événement complet'
                  ) : (
                    `Réserver maintenant${getTotalTickets() > 0 ? ` - ${formatPrice(getTotalPrice())}` : ''}`
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier le lien
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareOnFacebook}>
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareOnTwitter}>
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareOnLinkedIn}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareOnWhatsApp}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareByEmail}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Location */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Lieu de l'événement</h4>
                  <div className="text-sm space-y-1 mb-4">
                    <div className="font-medium">{event.venue}</div>
                    <div className="text-muted-foreground">{event.address}</div>
                  </div>
                  
                  {/* Google Maps Embed */}
                  <div className="aspect-video rounded-lg overflow-hidden border">
                    <iframe
                      src="https://maps.google.com/maps?q=Gymnase+Jean+Moulin+123+Avenue+des+Sports+75012+Paris&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Localisation de l'événement"
                    />
                  </div>
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