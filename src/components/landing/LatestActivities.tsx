
import React, { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
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
            organization:organizations(name)
          `)
                    .eq('status', 'published')
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
                <h2 className="text-3xl font-bold mb-8 text-foreground">Les dernières activités</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity) => {
                        // Handle images safely
                        let imageUrl = "https://images.unsplash.com/photo-1552674605-4694559e5bc7?w=800&auto=format&fit=crop&q=60"; // Default fallback
                        if (activity.images && Array.isArray(activity.images) && activity.images.length > 0) {
                            imageUrl = activity.images[0];
                        } else if (typeof activity.images === 'string') {
                            imageUrl = activity.images;
                        }

                        return (
                            <EventCard
                                key={activity.id}
                                id={activity.id}
                                title={activity.title}
                                date={format(new Date(activity.starts_at), "d MMMM yyyy", { locale: fr })}
                                location={activity.city || activity.venue || "Lieu non précisé"}
                                image={imageUrl}
                                tag={activity.organization?.name || "Événement"}
                                tagColor="bg-orange-500"
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
