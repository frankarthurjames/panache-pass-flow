
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
import { SEO } from "@/components/SEO";
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
  price_cents: number;
  starts_at: string;
}

interface Sport {
  id: string;
  name: string;
  slug: string;
}

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSportParam = searchParams.get('sport') || "Tous";
  const initialQuery = searchParams.get('q') || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSportSlug, setSelectedSportSlug] = useState(initialSportParam);
  const [dbSports, setDbSports] = useState<Sport[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("Date");

  // Fetch sports and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Sports
        const { data: sportsData } = await supabase
          .from('sports' as any)
          .select('*')
          .order('name');

        if (sportsData) {
          setDbSports(sportsData as any[]);
        }

        // 2. Fetch Events with sports join
        const { data: eventsData, error } = await supabase
          .from('events')
          .select(`
            *,
            sports:sport_id ( name, slug ),
            ticket_types ( price_cents )
          `)
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true });

        if (error) throw error;

        const formattedEvents = eventsData?.map(event => {
          const minPrice = event.ticket_types?.length > 0
            ? Math.min(...event.ticket_types.map((t: any) => t.price_cents))
            : 0;

          // Use DB sport if available, otherwise infer or fallback
          let tag = (event.sports as any)?.name;
          let tagSlug = (event.sports as any)?.slug || "sport";
          let tagColor = "bg-orange-500";

          if (!tag) {
            const sportMatch = event.title.match(/^\[(.*?)\]/);
            tag = sportMatch ? sportMatch[1] : "Sport";

            const titleLower = event.title.toLowerCase();
            if (titleLower.includes("tennis")) { tagColor = "bg-orange-500"; }
            else if (titleLower.includes("bmx") || titleLower.includes("skate")) { tagColor = "bg-orange-400"; }
            else if (titleLower.includes("natation") || titleLower.includes("piscine") || titleLower.includes("aquatique")) { tagColor = "bg-blue-500"; }
            else if (titleLower.includes("running") || titleLower.includes("marathon") || titleLower.includes("athlétisme")) { tagColor = "bg-red-500"; }
            else if (titleLower.includes("vtt") || titleLower.includes("vélo") || titleLower.includes("cyclisme")) { tagColor = "bg-green-600"; }
            else if (titleLower.includes("football") || titleLower.includes("foot ")) { tagColor = "bg-emerald-600"; }
            else if (titleLower.includes("kayak") || titleLower.includes("canoë")) { tagColor = "bg-sky-500"; }
          } else {
            // Colors based on slug for consistency
            if (tagSlug === "tennis") tagColor = "bg-orange-500";
            else if (tagSlug === "vtt" || tagSlug === "cyclisme") tagColor = "bg-green-600";
            else if (tagSlug === "natation") tagColor = "bg-blue-500";
            else if (tagSlug === "football") tagColor = "bg-emerald-600";
            else if (tagSlug === "athletisme") tagColor = "bg-red-500";
          }

          const hasMultiplePrices = event.ticket_types && new Set(event.ticket_types.map((t: any) => t.price_cents)).size > 1;
          const minPriceStr = minPrice > 0 ? `${(minPrice / 100).toFixed(0)}€` : 'Gratuit';
          const priceDisplay = hasMultiplePrices ? `Dès ${minPriceStr}` : minPriceStr;

          return {
            id: event.id,
            title: event.title,
            date: new Date(event.starts_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            location: event.city || 'Lieu à confirmer',
            image: event.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            tag,
            tagColor,
            tagSlug,
            price: priceDisplay,
            price_cents: minPrice,
            starts_at: event.starts_at
          };
        }) || [];
        setAllEvents(formattedEvents);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combined filtering and sorting logic
  const displayedEvents = useMemo(() => {
    let filtered = [...allEvents];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.tag.toLowerCase().includes(q)
      );
    }

    // Sport filter (supports slug or name)
    if (selectedSportSlug !== "Tous") {
      const normalizeStr = (str: string) =>
        str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

      const target = normalizeStr(selectedSportSlug);

      filtered = filtered.filter(e =>
        normalizeStr((e as any).tagSlug) === target ||
        normalizeStr(e.tag) === target
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Date":
          return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
        case "Prix":
          return a.price_cents - b.price_cents;
        case "Nom":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedSportSlug, sortBy, allEvents]);

  const handleSportSelect = (sportSlug: string) => {
    setSelectedSportSlug(sportSlug);
    const newParams = new URLSearchParams(searchParams);
    if (sportSlug === "Tous") {
      newParams.delete('sport');
    } else {
      newParams.set('sport', sportSlug);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('q', val);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO
        title="Tous les événements"
        description="Parcourez et réservez parmi une large sélection d'événements sportifs et activités."
      />
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
          <h1 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight">Tous les événements</h1>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-xl text-black">
              <Input
                placeholder="Rechercher un événement, un lieu..."
                className="h-14 rounded-full pl-6 pr-14 border-0 bg-white/95 focus:bg-white transition-colors shadow-lg text-lg"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
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

          {/* Sport Pills */}
          <div className="mt-10 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            <Button
              onClick={() => handleSportSelect("Tous")}
              variant={selectedSportSlug === "Tous" ? "default" : "outline"}
              className={`rounded-full px-6 h-10 font-medium transition-all ${selectedSportSlug === "Tous"
                ? "bg-[#F97316] hover:bg-[#EA580C] text-white border-0"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
            >
              Tous
            </Button>
            {dbSports.map((sport) => (
              <Button
                key={sport.id}
                onClick={() => handleSportSelect(sport.slug)}
                variant={selectedSportSlug === sport.slug ? "default" : "outline"}
                className={`rounded-full px-6 h-10 font-medium transition-all ${selectedSportSlug === sport.slug
                  ? "bg-[#F97316] hover:bg-[#EA580C] text-white border-0"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
              >
                {sport.name}
              </Button>
            ))}
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
            Aucun événement trouvé.
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
                price={event.price}
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