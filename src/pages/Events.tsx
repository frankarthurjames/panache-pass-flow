
import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  tag: string;
  tagColor: string;
  price: string;
  starts_at: string;
}

const Events = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("Date");

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data: eventsData, error } = await supabase
          .from('events')
          .select(`
            *,
            ticket_types ( price_cents )
          `)
          .eq('status', 'published')
          .order('starts_at', { ascending: true });

        if (error) throw error;

        const formattedEvents = eventsData?.map(event => {
          const minPrice = event.ticket_types?.length > 0
            ? Math.min(...event.ticket_types.map((t: any) => t.price_cents))
            : 0;

          // Infer tag from title or description for demo purposes
          let tag = "Sport";
          let tagColor = "bg-orange-500";
          const titleLower = event.title.toLowerCase();
          if (titleLower.includes("tennis")) { tag = "Tennis"; tagColor = "bg-orange-500"; }
          else if (titleLower.includes("bmx") || titleLower.includes("skate")) { tag = "BMX"; tagColor = "bg-orange-400"; }
          else if (titleLower.includes("natation") || titleLower.includes("piscine")) { tag = "Natation"; tagColor = "bg-blue-500"; }
          else if (titleLower.includes("running") || titleLower.includes("marathon")) { tag = "Athlétisme"; tagColor = "bg-red-500"; }
          else if (titleLower.includes("vtt") || titleLower.includes("vélo")) { tag = "VTT"; tagColor = "bg-green-600"; }

          return {
            id: event.id,
            title: event.title,
            date: new Date(event.starts_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            location: event.city || 'Lieu à confirmer',
            image: event.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            tag,
            tagColor,
            price: minPrice > 0 ? `${(minPrice / 100).toFixed(0)}€` : 'Gratuit',
            starts_at: event.starts_at
          };
        }) || [];

        setAllEvents(formattedEvents);
        setDisplayedEvents(formattedEvents);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = allEvents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.tag.toLowerCase().includes(q)
      );
    }
    setDisplayedEvents(filtered);
  }, [searchQuery, allEvents]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar variant="orange" />

      {/* Hero Header Section */}
      <div className="relative pt-40 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Slanted bottom edge */}
        <div
          className="absolute bottom-0 left-0 w-full h-16 bg-white z-10"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />

        <div className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight">Toutes les activités</h1>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-xl text-black">
              <Input
                placeholder="Rechercher une activité, un lieu..."
                className="h-14 rounded-full pl-6 pr-14 border-0 bg-white/95 focus:bg-white transition-colors shadow-lg text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                className="absolute right-2 top-2 h-10 w-10 rounded-full p-0 flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                style={{ background: "#F97316" }}
              >
                <Search className="h-5 w-5 text-white" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-medium text-white/80 whitespace-nowrap">Trier par</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white h-10 px-6 gap-2 min-w-[160px] justify-between font-medium backdrop-blur-sm">
                    {sortBy}
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => setSortBy("Date")}>Date</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("Prix")}>Prix</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("Nom")}>Nom</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <main className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Aucune activité trouvée.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                image={event.image}
                tag={event.tag}
                tagColor={event.tagColor}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Events;