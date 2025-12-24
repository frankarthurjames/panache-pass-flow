
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
          .select(`*, organizations ( name )`)
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

  return (
    <div className="min-h-screen bg-white font-sans">
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
          <h1 className="text-4xl md:text-6xl font-bold mb-2">{event.title}</h1>
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
            <div className="prose max-w-none text-gray-600 leading-relaxed">
              {event.description || "Aucune description disponible."}
              <p className="mt-4">
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
              </p>
            </div>

            {/* Mock Image Placeholder */}
            <div className="mt-12 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p>Image Placeholder</p>
                <p className="text-sm">(Mock div as requested)</p>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Details Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 rounded-xl overflow-hidden sticky top-24">
              <div className="p-8">
                <h3 className="text-xl font-bold mb-6">Détails de l'activité</h3>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 text-white px-4 py-1 rounded-full font-bold text-sm">
                      <Euro className="h-4 w-4 inline mr-1" />
                      25€
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-black" />
                      <span className="font-medium text-black">www.nymarathon.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-black" />
                      <span className="font-medium text-black">contact@nymarathon.com</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-black mt-1" />
                      <span className="font-medium text-black">
                        2972 Westheimer Rd.<br />
                        Santa Ana, Illinois 85486
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Nearby Section */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold mb-8">A proximité</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyEvents.map((e) => (
              <EventCard
                key={e.id}
                id={e.id}
                title={e.title}
                date={new Date(e.starts_at).toLocaleDateString('fr-FR')}
                location={e.city || 'Lieu à confirmer'}
                image={e.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'}
                tag="Sport"
                tagColor="bg-orange-500"
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;