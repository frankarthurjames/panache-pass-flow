
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/EventCard";

// Mock data based on the visual
const ACTIVITIES = [
    {
        id: 1,
        title: "Open 6ème sens",
        date: "22 juin 2021",
        location: "69001 Lyon",
        image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60",
        tag: "Tennis",
        tagColor: "bg-orange-500", // Orange for Tennis
    },
    {
        id: 2,
        title: "Skate Parc Gerland",
        date: "22 juin 2021",
        location: "69001 Lyon",
        image: "https://images.unsplash.com/photo-1520045864914-6948b3bfbc62?w=800&auto=format&fit=crop&q=60",
        tag: "BMX",
        tagColor: "bg-orange-400", // Lighter orange for BMX
    },
    {
        id: 3,
        title: "France Élite Miramas",
        date: "22 juin 2021",
        location: "69001 Lyon",
        image: "https://images.unsplash.com/photo-1552674605-4694559e5bc7?w=800&auto=format&fit=crop&q=60",
        tag: "Athlétisme",
        tagColor: "bg-orange-500",
    },
    {
        id: 4,
        title: "VTT Cross Country",
        date: "22 juin 2021",
        location: "69001 Lyon",
        image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=60",
        tag: "VTT",
        tagColor: "bg-orange-500",
    },
    {
        id: 5,
        title: "Meeting des Vendanges",
        date: "22 juin 2021",
        location: "69001 Lyon",
        image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=60",
        tag: "Natation",
        tagColor: "bg-orange-500",
    },
    {
        id: 6,
        title: "Equita Lyon 2021",
        date: "22 juin 2021",
        location: "69001 Lyon",
        image: "https://images.unsplash.com/photo-1534234828563-025c93e4a555?w=800&auto=format&fit=crop&q=60",
        tag: "Équitation",
        tagColor: "bg-orange-500",
    },
];

export const LatestActivities = () => {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-foreground">Les dernières activités</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ACTIVITIES.map((activity) => (
                        <EventCard
                            key={activity.id}
                            id={activity.id}
                            title={activity.title}
                            date={activity.date}
                            location={activity.location}
                            image={activity.image}
                            tag={activity.tag}
                            tagColor={activity.tagColor}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
