
import React from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "./SectionHeading";

const REGIONS = [
    { name: "Île-de-France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=60" },
    { name: "Auvergne-Rhône-Alpes", image: "https://images.unsplash.com/photo-1599827699703-d5272a808e0e?w=800&auto=format&fit=crop&q=60" },
    { name: "Provence-Alpes-Côte d'Azur", image: "https://images.unsplash.com/photo-1534234828563-025c93e4a555?w=800&auto=format&fit=crop&q=60" },
];

export const RegionsGrid = () => {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <SectionHeading
                    title="Parcourir par région"
                    subtitle="Trouve des événements près de chez toi."
                />
                <div className="grid md:grid-cols-3 gap-8">
                    {REGIONS.map((region) => (
                        <Link
                            key={region.name}
                            to={`/events?region=${encodeURIComponent(region.name)}`}
                            className="group relative aspect-video overflow-hidden rounded-2xl bg-muted"
                        >
                            <img
                                src={region.image}
                                alt={region.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <h3 className="text-2xl font-bold text-white text-center px-4">{region.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
