import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Loader2, Calendar as CalendarIcon, MapPin, Trophy, LayoutList, CalendarDays, ChevronRight, Clock, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, isSameDay, parseISO, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";


interface Event {
    id: string;
    title: string;
    starts_at: string;
    city: string;
    sport: string;
    sportColor: string;
    sportTextColor: string;
    image: string;
    description: string;
}

const CalendarPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [view, setView] = useState("calendar");
    const [searchQuery, setSearchQuery] = useState("");

    const inferSport = (title: string, description: string) => {
        const text = (title + " " + (description || "")).toLowerCase();
        if (text.includes("tennis de table") || text.includes("ping pong")) return { name: "Tennis de Table", color: "bg-orange-500", textColor: "text-orange-600" };
        if (text.includes("tennis")) return { name: "Tennis", color: "bg-orange-500", textColor: "text-orange-600" };
        if (text.includes("football") || text.includes("foot")) return { name: "Football", color: "bg-green-600", textColor: "text-green-700" };
        if (text.includes("basketball") || text.includes("basket")) return { name: "Basketball", color: "bg-orange-600", textColor: "text-orange-700" };
        if (text.includes("running") || text.includes("course") || text.includes("marathon")) return { name: "Course à pied", color: "bg-blue-500", textColor: "text-blue-600" };
        if (text.includes("cyclisme") || text.includes("vélo") || text.includes("vtt")) return { name: "Cyclisme", color: "bg-emerald-500", textColor: "text-emerald-600" };
        if (text.includes("natation") || text.includes("piscine")) return { name: "Natation", color: "bg-sky-500", textColor: "text-sky-600" };
        if (text.includes("badminton")) return { name: "Badminton", color: "bg-yellow-500", textColor: "text-yellow-600" };
        if (text.includes("padel")) return { name: "Padel", color: "bg-blue-600", textColor: "text-blue-700" };
        if (text.includes("rugby")) return { name: "Rugby", color: "bg-blue-800", textColor: "text-blue-900" };
        if (text.includes("handball") || text.includes("hand")) return { name: "Handball", color: "bg-red-600", textColor: "text-red-700" };
        if (text.includes("volleyball") || text.includes("volley")) return { name: "Volleyball", color: "bg-blue-400", textColor: "text-blue-500" };
        if (text.includes("yoga") || text.includes("pilates")) return { name: "Yoga", color: "bg-purple-500", textColor: "text-purple-600" };
        if (text.includes("crossfit") || text.includes("fitness") || text.includes("gym")) return { name: "Fitness", color: "bg-gray-800", textColor: "text-gray-900" };
        if (text.includes("danse")) return { name: "Danse", color: "bg-pink-500", textColor: "text-pink-600" };
        if (text.includes("judo") || text.includes("karate") || text.includes("boxe") || text.includes("combat")) return { name: "Combat", color: "bg-red-700", textColor: "text-red-800" };
        if (text.includes("golf")) return { name: "Golf", color: "bg-green-700", textColor: "text-green-800" };
        if (text.includes("equitation") || text.includes("cheval")) return { name: "Équitation", color: "bg-amber-700", textColor: "text-amber-800" };
        return { name: "Sport", color: "bg-orange-500", textColor: "text-orange-600" };
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('status', 'published')
                    .gte('starts_at', new Date().toISOString())
                    .order('starts_at', { ascending: true });

                if (error) throw error;

                const formatted = data?.map(e => {
                    const sportInfo = inferSport(e.title, e.description || "");
                    const eventImages = Array.isArray(e.images) ? e.images : [];
                    const imageUrl = typeof eventImages[0] === 'string' ? eventImages[0] : 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&q=80';

                    return {
                        id: e.id,
                        title: e.title,
                        starts_at: e.starts_at,
                        city: e.city || 'À confirmer',
                        description: e.description || "",
                        sport: sportInfo.name,
                        sportColor: sportInfo.color,
                        sportTextColor: sportInfo.textColor,
                        image: imageUrl
                    };
                }) || [];

                setEvents(formatted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const dayEvents = events.filter(event =>
        selectedDate && isSameDay(parseISO(event.starts_at), selectedDate)
    );

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.sport.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedEvents = filteredEvents.reduce((acc, event) => {
        const month = format(parseISO(event.starts_at), 'MMMM yyyy', { locale: fr });
        if (!acc[month]) acc[month] = [];
        acc[month].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans">
            <SEO
                title="Calendrier des événements"
                description="Consultez le calendrier complet de toutes les activités sportives et événements prévus sur Panache."
            />
            <Navbar variant="orange" />

            <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Calendrier des événements</h1>
                        <p className="text-gray-600 text-lg">Découvrez tous les événements à venir sur Panache.</p>
                    </div>

                    <Tabs value={view} onValueChange={setView} className="w-full md:w-auto">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1.5 rounded-full border border-gray-200">
                            <TabsTrigger value="calendar" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md gap-2 px-6">
                                <CalendarDays className="h-4 w-4" />
                                Calendrier
                            </TabsTrigger>
                            <TabsTrigger value="table" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md gap-2 px-6">
                                <LayoutList className="h-4 w-4" />
                                Liste
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Aucun événement prévu</h3>
                        <p className="text-gray-500 mt-2">Revenez plus tard pour de nouvelles activités !</p>
                    </div>
                ) : (
                    <Tabs value={view} onValueChange={setView} className="w-full">
                        <TabsContent value="table" className="mt-0 ring-offset-transparent outline-none space-y-8">
                            <div className="relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Rechercher par sport, ville..."
                                    className="pl-12 h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {Object.keys(groupedEvents).length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-500">Aucun événement ne correspond à votre recherche.</p>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {(Object.entries(groupedEvents) as [string, Event[]][]).map(([month, monthEvents]) => (
                                        <div key={month} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-lg font-black text-gray-900 capitalize whitespace-nowrap">{month}</h3>
                                                <div className="h-px bg-gray-100 w-full" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {monthEvents.map((event) => (
                                                    <Link
                                                        key={event.id}
                                                        to={`/events/${event.id}`}
                                                        className="group flex flex-col rounded-3xl bg-white border border-gray-100 hover:border-orange-200 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden"
                                                    >
                                                        <div className="h-48 overflow-hidden">
                                                            <img
                                                                src={event.image}
                                                                alt={event.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <div className="p-6 flex flex-col h-full">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className={cn("h-2 w-2 rounded-full", event.sportColor)} />
                                                                <Badge variant="secondary" className={cn("bg-transparent border-0 p-0 text-[10px] font-black uppercase tracking-widest", event.sportTextColor)}>
                                                                    {event.sport}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors mb-4 line-clamp-2">
                                                                {event.title}
                                                            </h4>
                                                            <div className="mt-auto space-y-2">
                                                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                                    <CalendarIcon className="h-4 w-4 text-orange-500" />
                                                                    {format(parseISO(event.starts_at), 'd MMMM yyyy', { locale: fr })}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                                    <MapPin className="h-4 w-4 text-orange-500" />
                                                                    {event.city}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="calendar" className="mt-0 ring-offset-transparent outline-none">
                            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">

                                {/* Side Calendar Picker */}
                                <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
                                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-32 overflow-hidden">
                                        <h3 className="text-lg font-extrabold mb-4 px-2">Sélectionner une date</h3>
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            locale={fr}
                                            className="rounded-xl border-0 shadow-none p-0 w-full"
                                            classNames={{
                                                months: "w-full",
                                                month: "w-full space-y-4",
                                                table: "w-full border-collapse",
                                                head_row: "flex w-full justify-between",
                                                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.75rem] uppercase tracking-tighter",
                                                row: "flex w-full mt-2 justify-between",
                                                cell: "h-8 w-8 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                                day: cn(
                                                    "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-lg hover:bg-orange-50 transition-colors",
                                                    "flex items-center justify-center text-sm"
                                                ),
                                                day_selected: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm font-bold",
                                                day_today: "bg-gray-100 text-gray-900 font-bold",
                                                nav: "space-x-1 flex items-center justify-between mb-4 px-2",
                                                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-200 rounded-md flex items-center justify-center",
                                                caption: "flex justify-center py-1 relative items-center text-sm font-bold capitalize",
                                                caption_label: "text-sm font-black"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Event List for Day */}
                                <div className="lg:col-span-8 xl:col-span-9">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight capitalize">
                                            {selectedDate
                                                ? format(selectedDate, 'EEEE d MMMM', { locale: fr })
                                                : "Sélectionnez une date"}
                                        </h2>
                                        <Badge variant="secondary" className="w-fit px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 font-bold border-0 text-sm">
                                            {dayEvents.length} {dayEvents.length > 1 ? 'événements' : 'événement'}
                                        </Badge>
                                    </div>

                                    {dayEvents.length === 0 ? (
                                        <div className="py-32 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                                                <Clock className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 text-lg">Aucun événement n'est programmé pour ce jour-là.</p>
                                            <Button
                                                variant="link"
                                                className="mt-2 text-orange-600 font-bold"
                                                onClick={() => setView("table")}
                                            >
                                                Voir tous les événements
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="max-h-[70vh] overflow-y-auto pr-4 -mr-4 space-y-6 custom-scrollbar">
                                            {dayEvents.map((event) => (
                                                <Link
                                                    key={event.id}
                                                    to={`/events/${event.id}`}
                                                    className="group relative flex flex-col md:flex-row gap-6 p-1 rounded-3xl bg-white border border-gray-100 hover:border-orange-200 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-orange-200/20 overflow-hidden cursor-pointer"
                                                >
                                                    {/* Image Section */}
                                                    <div className="md:w-64 lg:w-72 h-48 md:h-auto overflow-hidden rounded-[22px] flex-none">
                                                        <img
                                                            src={event.image}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    </div>

                                                    {/* Content Section */}
                                                    <div className="flex-auto p-4 md:p-6 md:pl-0 flex flex-col justify-center">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", event.sportColor)} />
                                                            <Badge variant="secondary" className={cn("bg-transparent border-0 p-0 text-[10px] font-black uppercase tracking-widest", event.sportTextColor)}>
                                                                {event.sport}
                                                            </Badge>
                                                        </div>

                                                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-orange-700 transition-colors mb-4 leading-tight">
                                                            {event.title}
                                                        </h3>

                                                        <div className="flex flex-wrap gap-x-8 gap-y-3 text-gray-600 font-medium">
                                                            <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 rounded-xl group-hover:bg-orange-50 transition-colors">
                                                                <Clock className="h-5 w-5 text-orange-500" />
                                                                <span className="text-base">{format(parseISO(event.starts_at), 'HH:mm')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2.5 px-4 py-2 bg-gray-50 rounded-xl group-hover:bg-orange-50 transition-colors">
                                                                <MapPin className="h-5 w-5 text-orange-500" />
                                                                <span className="text-base">{event.city}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex">
                                                        <div className="bg-gray-50 h-14 w-14 rounded-full flex items-center justify-center border border-gray-100 shadow-sm group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                                                            <ChevronRight className="h-6 w-6" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}


                                    {/* Mobile Calendar view (visible only on mobile) */}
                                    <div className="mt-16 lg:hidden">
                                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                                            <h3 className="text-xl font-extrabold mb-6">Sélectionner une date</h3>
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                locale={fr}
                                                className="w-full flex justify-center p-0"
                                                classNames={{
                                                    months: "w-full",
                                                    month: "w-full space-y-4",
                                                    table: "w-full border-collapse",
                                                    head_row: "flex w-full justify-center gap-2",
                                                    head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] uppercase",
                                                    row: "flex w-full mt-2 justify-center gap-2",
                                                    cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                                    day: cn(
                                                        "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-xl hover:bg-orange-50 transition-colors",
                                                        "flex items-center justify-center text-base"
                                                    ),
                                                    day_selected: "bg-orange-600 text-white hover:bg-orange-700 shadow-md font-bold",
                                                    day_today: "bg-gray-100 text-gray-900 font-bold",
                                                    nav: "space-x-1 flex items-center justify-between mb-6",
                                                    nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-200 rounded-lg flex items-center justify-center",
                                                    caption: "flex justify-center py-1 relative items-center text-lg font-bold capitalize",
                                                    caption_label: "text-base font-black"
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CalendarPage;
