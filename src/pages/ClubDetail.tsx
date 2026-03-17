
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/EventCard";
import { Facebook, Instagram, Linkedin, MapPin, Phone, Globe, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SEO } from "@/components/SEO";

const ClubDetail = () => {
    const { id } = useParams();
    const [club, setClub] = useState<any>(null);
    const [clubEvents, setClubEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClubData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // Fetch organization
                const { data: org, error: orgError } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (orgError) throw orgError;
                setClub(org);

                // Fetch published events for this org
                const { data: events, error: eventsError } = await supabase
                    .from('events')
                    .select('*, ticket_types(price_cents)')
                    .eq('organization_id', id)
                    .eq('status', 'published')
                    .gte('starts_at', new Date().toISOString())
                    .order('starts_at', { ascending: true });

                if (eventsError) throw eventsError;
                setClubEvents(events || []);

            } catch (err) {
                console.error("Error fetching club data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClubData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!club) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Club introuvable</h1>
                <Link to="/" className="text-orange-500 hover:underline">Retour à l'accueil</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <SEO
                title={club.name}
                description={club.description?.substring(0, 160) || `Découvrez le club ${club.name} sur Panache.`}
                image={club.logo_url || club.banner_url}
            />
            <Navbar variant="transparent" />

            {/* Hero Section */}
            <div className="relative h-[400px] overflow-hidden">
                {/* Slanted Background */}
                <div
                    className="absolute inset-0 bg-[#F97316] transform -skew-y-3 origin-top-left scale-110"
                    style={{ zIndex: 0 }}
                />

                {/* Background Image Overlay (Optional, using solid pink as per mock for now, but mock has image) */}
                <div className="absolute inset-0 z-0 opacity-50">
                    <img
                        src={club.banner_url || "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80"}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#F97316]/80 mix-blend-multiply" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10 pt-20">
                    <div className="text-white max-w-2xl">
                        <h1 className="text-5xl font-bold mb-4">{club.name}</h1>
                        <div className="flex gap-3 mb-6">
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 px-3 py-1 text-sm">
                                Club
                            </Badge>
                        </div>
                        <div className="flex gap-4">
                            {club.website && (
                                <a href={club.website} target="_blank" rel="noopener noreferrer" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                                    <Globe className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Description & Events */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Description</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {club.description}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6">Événements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {clubEvents.length > 0 ? (
                                    clubEvents.map(event => {
                                        const minPrice = event.ticket_types && event.ticket_types.length > 0
                                            ? Math.min(...event.ticket_types.map((t: any) => t.price_cents))
                                            : 0;

                                        const hasMultiplePrices = event.ticket_types && new Set(event.ticket_types.map((t: any) => t.price_cents)).size > 1;
                                        const minPriceStr = minPrice > 0 ? `${(minPrice / 100).toFixed(0)}€` : 'Gratuit';
                                        const priceDisplay = hasMultiplePrices ? `Dès ${minPriceStr}` : minPriceStr;

                                        const sportMatch = event.title.match(/^\[(.*?)\]/);
                                        const tag = sportMatch ? sportMatch[1] : "Sport";

                                        return (
                                            <EventCard
                                                key={event.id}
                                                id={event.id}
                                                title={event.title}
                                                date={format(new Date(event.starts_at), "d MMMM yyyy", { locale: fr })}
                                                location={event.city || event.venue || "Lieu à confirmer"}
                                                image={event.images?.[0] || 'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80'}
                                                tag={tag}
                                                tagColor="bg-orange-500"
                                                price={priceDisplay}
                                            />
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 col-span-2">Aucun événement prévu prochainement.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Contact Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24 border border-gray-100">
                            <div className="p-6 space-y-6">
                                <h3 className="text-xl font-bold">Coordonnées du club</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="font-medium">{club.phone}</span>
                                    </div>
                                    {club.website && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Globe className="h-5 w-5 text-gray-400" />
                                            <a href={club.website.startsWith('http') ? club.website : `https://${club.website}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                                                {club.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                    {club.billing_email && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <a href={`mailto:${club.billing_email}`} className="font-medium hover:underline">{club.billing_email}</a>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 text-gray-700">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                        <span className="font-medium max-w-[200px]">{club.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Club Logo Area */}
                            <div className="bg-primary p-8 flex justify-center items-center relative overflow-hidden h-48">
                                {/* Slanted divider */}
                                <div className="absolute top-0 left-0 w-full h-8 bg-white" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)" }}></div>

                                <div className="bg-white p-4 rounded-xl shadow-lg relative z-10 transform rotate-3">
                                    <img src={club.logo_url || "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c7/Logo_FC_Lyon_2020.svg/1200px-Logo_FC_Lyon_2020.svg.png"} alt={club.name} className="h-24 w-24 object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ClubDetail;
