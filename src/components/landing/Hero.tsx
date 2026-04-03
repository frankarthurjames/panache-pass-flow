
import React, { useState } from "react";
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
    const [sport, setSport] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");

    const goSearch = () => {
        const params = new URLSearchParams();
        if (sport) params.append("sport", sport);
        if (location) params.append("location", location);
        if (date) params.append("date", date);
        
        const queryString = params.toString();
        navigate(queryString ? `/events?${queryString}` : "/events");
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
                    Trouvez un événement sportif près de chez vous
                </h2>

                {/* Barre de recherche avec 3 inputs : Lieu, Sport, Date */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-full p-2 shadow-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0">
                        <div className="flex-1 w-full relative">
                            <Input
                                placeholder="Lieu"
                                className="h-12 border-0 focus-visible:ring-0 text-black placeholder:text-gray-400 text-lg md:border-r border-gray-100 rounded-none"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 w-full relative">
                            <Input
                                placeholder="Sport"
                                className="h-12 border-0 focus-visible:ring-0 text-black placeholder:text-gray-400 text-lg md:border-r border-gray-100 rounded-none"
                                value={sport}
                                onChange={(e) => setSport(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 w-full relative">
                            <Input
                                type="date"
                                className="h-12 border-0 focus-visible:ring-0 text-black placeholder:text-gray-400 text-lg rounded-none"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={goSearch}
                            className="w-full md:w-14 h-12 md:h-14 md:rounded-full p-0 flex items-center justify-center hover:scale-105 transition-transform shadow-md shrink-0"
                            style={{ background: "#F97316" }}
                        >
                            <Search className="h-6 w-6 text-white" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
