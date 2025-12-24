
import React, { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HeroProps {
    stats: {
        totalEvents: number;
        totalTickets: number;
        satisfaction: number;
    };
    loading: boolean;
}

export const Hero = ({ stats, loading }: HeroProps) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const goSearch = () => {
        const q = searchQuery.trim();
        navigate(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") goSearch();
    };

    return (
        <header className="relative h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80"
                    alt="Sport background"
                    className="h-full w-full object-cover brightness-50"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mt-16">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                    Panache
                </h1>

                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-10">
                    Trouvez une activité sportive à proximité.
                </h2>

                {/* Barre de recherche arrondie */}
                <div className="max-w-2xl mx-auto relative">
                    <div className="relative flex items-center">
                        <Input
                            placeholder="Sport, Lieu..."
                            className="h-14 rounded-full pl-6 pr-16 bg-white border-0 text-black placeholder:text-gray-400 shadow-lg focus-visible:ring-0 text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                        />
                        <Button
                            onClick={goSearch}
                            className="absolute right-2 h-10 w-10 rounded-full p-0 flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                            style={{ background: "#F97316" }}
                        >
                            <Search className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
