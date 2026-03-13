
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/EventCard";
import {
  MapPin,
  Mail,
  Globe,
  Euro,
  Linkedin,
  Instagram,
  Facebook,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import EventCheckout from "@/components/EventCheckout";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select(`
            *, 
            organizations ( 
              name, 
              website, 
              address, 
              billing_email,
              billing_country 
            ),
            ticket_types ( 
              id,
              name,
              price_cents, 
              currency,
              quantity,
              max_per_order
            ),
            registrations (
              id,
              ticket_type_id
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent(data);

        // Fetch nearby events (mock logic: just fetch 3 other events)
        const { data: nearby } = await supabase
          .from('events')
          .select('*')
          .neq('id', id)
          .limit(3);

        setNearbyEvents(nearby || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!event) return <div>Événement non trouvé</div>;

  const eventDate = new Date(event.starts_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Calculate minimum price
  const minPrice = event.ticket_types && event.ticket_types.length > 0
    ? Math.min(...event.ticket_types.map((t: any) => t.price_cents)) / 100
    : null;

  const organization = event.organizations;

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO
        title={event.title}
        description={event.description?.substring(0, 160) || `Réservez votre place pour ${event.title} le ${eventDate}.`}
        image={event.images?.[0]}
      />
      <Navbar variant="orange" />

      {/* Slanted Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={event.images?.[0] || "https://images.unsplash.com/photo-1552674605-4694559e5bc7?w=1600&q=80"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Slanted bottom edge */}
        <div
          className="absolute bottom-0 left-0 w-full h-24 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-white pb-20">
          {event.title.match(/^\[(.*?)\]/) && (
            <Badge className="w-fit mb-4 bg-orange-500 hover:bg-orange-600 text-white border-0 py-1 px-4 text-sm font-bold rounded-full shadow-lg">
              {event.title.match(/^\[(.*?)\]/)?.[1]}
            </Badge>
          )}
          <h1 className="text-4xl md:text-6xl font-bold mb-2">
            {event.title.replace(/^\[.*?\]\s*/, '')}
          </h1>
          <div className="text-xl md:text-2xl font-medium opacity-90">
            {eventDate} | {event.city || "Lieu à confirmer"}
          </div>

          <div className="flex gap-4 mt-6">
            <a href="#" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column: Description */}
          <div className="lg:col-span-2 pt-12 lg:pt-32">
            <h2 className="text-2xl font-bold mb-6">Description</h2>
            <div className="prose max-w-none text-gray-600 leading-relaxed mb-12">
              {event.description || "Aucune description disponible."}
            </div>

            {/* Carousel Section */}
            {event.images && event.images.length > 1 && (
              <div className="mt-12 px-12">
                <Carousel className="w-full">
                  <CarouselContent>
                    {(event.images as string[]).slice(1).map((img, idx) => (
                      <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/2">
                        <div className="p-1">
                          <Card className="border-0 overflow-hidden rounded-2xl">
                            <CardContent className="flex aspect-video items-center justify-center p-0">
                              <img
                                src={img}
                                alt={`${event.title} ${idx + 2}`}
                                className="w-full h-full object-cover"
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}
          </div>

          {/* Right Column: Floating Details Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 rounded-2xl overflow-hidden sticky top-24">
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Détails de l'activité
                  </h3>
                  {minPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-black">{minPrice}€</span>
                      <span className="text-gray-500 font-medium text-sm">/ billet</span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold">Prix non disponible</span>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Location Info */}
                  <div className="space-y-3 py-4 border-y border-gray-100">
                    {(event.venue || event.city) && (
                      <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-black leading-tight">
                            {event.venue || "Lieu de l'événement"}
                          </p>
                          <p className="text-sm text-gray-500">{event.city}</p>
                        </div>
                      </div>
                    )}

                    {organization?.billing_country && (
                      <div className="flex items-center gap-4">
                        <Globe className="h-5 w-5 text-orange-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-700">
                          {organization.billing_country}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tickets List */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-black uppercase tracking-tight">
                      Billets disponibles
                    </h4>
                    <div className="space-y-2">
                      {event.ticket_types && event.ticket_types.length > 0 ? (
                        event.ticket_types.map((ticket: any) => {
                          const soldCount = (event.registrations || []).filter((r: any) => r.ticket_type_id === ticket.id).length;
                          const remaining = Math.max(0, ticket.quantity - soldCount);

                          return (
                            <div key={ticket.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-800 text-sm">{ticket.name}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                                  {remaining > 0 ? `${remaining} Restants` : 'Épuisé'}
                                </span>
                              </div>
                              <span className="font-bold text-orange-600 text-sm">
                                {ticket.price_cents / 100}€
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500">Aucun billet configuré</p>
                      )}
                    </div>
                  </div>

                  {/* CTA Button wrapped in Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full h-14 rounded-xl bg-black hover:bg-black/90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        Réserver ma place
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden">
                      <div className="max-h-[85vh] overflow-y-auto">
                        <EventCheckout
                          eventId={event.id}
                          eventTitle={event.title}
                          eventDate={eventDate}
                          ticketTypes={event.ticket_types || []}
                          registrations={event.registrations || []}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Contact info simplified */}
                  {organization?.billing_email && (
                    <div className="pt-2 text-center text-[11px] text-gray-400">
                      Besoin d'aide ? <a href={`mailto:${organization.billing_email}`} className="underline hover:text-orange-500">Contactez l'organisateur</a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Nearby Section */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold mb-8">A proximité</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyEvents.map((e) => {
              const minPrice = e.ticket_types?.length > 0
                ? Math.min(...e.ticket_types.map((t: any) => t.price_cents)) / 100
                : 0;

              const hasMultiplePrices = e.ticket_types && new Set(e.ticket_types.map((t: any) => t.price_cents)).size > 1;
              const priceDisplay = minPrice > 0
                ? (hasMultiplePrices ? `Dès ${minPrice.toFixed(0)}€` : `${minPrice.toFixed(0)}€`)
                : 'Gratuit';

              const sportMatch = e.title.match(/^\[(.*?)\]/);
              const tag = sportMatch ? sportMatch[1] : "Sport";

              return (
                <EventCard
                  key={e.id}
                  id={e.id}
                  title={e.title}
                  date={new Date(e.starts_at).toLocaleDateString('fr-FR')}
                  location={e.city || 'Lieu à confirmer'}
                  image={e.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'}
                  tag={tag}
                  tagColor="bg-orange-500"
                  price={priceDisplay}
                />
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;