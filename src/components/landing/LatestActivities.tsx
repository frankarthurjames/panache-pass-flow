
import React, { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface EventWithOrg {
    id: string;
    title: string;
    starts_at: string;
    city: string | null;
    venue: string | null;
    images: any;
    organization: {
        name: string;
    } | null;
}

export const LatestActivities = () => {
    const [activities, setActivities] = useState<EventWithOrg[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select(`
            id,
            title,
            starts_at,
            city,
            venue,
            images,
            organization:organizations(name),
            ticket_types(price_cents)
          `)
                    .eq('status', 'published')
                    .gte('starts_at', new Date().toISOString())
                    .order('created_at', { ascending: false })
                    .limit(6);

                if (error) throw error;
                setActivities(data || []);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            </section>
        );
    }

    if (activities.length === 0) {
        return null; // Or show a message
    }

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-foreground">Les derniers événements</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity: any) => {
                        // Handle images safely
                        let imageUrl = "https://images.unsplash.com/photo-1552674605-4694559e5bc7?w=800&auto=format&fit=crop&q=60"; // Default fallback
                        if (activity.images && Array.isArray(activity.images) && activity.images.length > 0) {
                            imageUrl = activity.images[0];
                        }

                        const minPrice = activity.ticket_types && activity.ticket_types.length > 0
                            ? Math.min(...activity.ticket_types.map((t: any) => t.price_cents)) / 100
                            : 0;

                        const hasMultiplePrices = activity.ticket_types && new Set(activity.ticket_types.map((t: any) => t.price_cents)).size > 1;
                        const priceDisplay = minPrice > 0
                            ? (hasMultiplePrices ? `Dès ${minPrice.toFixed(0)}€` : `${minPrice.toFixed(0)}€`)
                            : 'Gratuit';

                        const sportMatch = activity.title.match(/^\[(.*?)\]/);
                        const tag = sportMatch ? sportMatch[1] : (activity.organization?.name || "Événement");

                        return (
                            <EventCard
                                key={activity.id}
                                id={activity.id}
                                title={activity.title}
                                date={format(new Date(activity.starts_at), "d MMMM yyyy", { locale: fr })}
                                location={activity.city || activity.venue || "Lieu non précisé"}
                                image={imageUrl}
                                tag={tag}
                                tagColor="bg-orange-500"
                                price={priceDisplay}
                            />
                        );
                    })}
                </div>
                <div className="mt-12 flex justify-center">
                    <Button asChild variant="outline" className="rounded-full px-8 h-12 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold">
                        <Link to="/events">Voir tous les événements</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};
