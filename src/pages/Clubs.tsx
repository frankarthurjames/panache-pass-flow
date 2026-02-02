
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClubCard } from "@/components/ClubCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface Club {
    id: string;
    name: string;
    category: string;
    address: string | null;
    logo_url: string | null;
}

const Clubs = () => {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Nom");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                // Fetch organizations with category 'club'
                // Note: 'category' column must exist in the database
                const { data, error } = await supabase
                    .from('organizations')
                    .select('id, name, category, address, logo_url')
                    .eq('category', 'club');

                if (error) throw error;
                setClubs(data || []);
            } catch (error) {
                console.error("Error fetching clubs:", error);
                // Fallback to empty list or handle error appropriately
            } finally {
                setLoading(false);
            }
        };

        fetchClubs();
    }, []);

    const displayedClubs = clubs.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.category && club.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (club.address && club.address.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => {
        if (sortBy === "Nom") return a.name.localeCompare(b.name);
        if (sortBy === "Sport") return (a.category || "").localeCompare(b.category || "");
        if (sortBy === "Ville") return (a.address || "").localeCompare(b.address || "");
        return 0;
    });

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar variant="orange" />

            {/* Header Section */}
            <div className="pt-40 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-10 tracking-tight">Tous les clubs</h1>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-xl">
                        <Input
                            placeholder="Sport, Lieu..."
                            className="h-14 rounded-full pl-6 pr-14 border-0 bg-gray-100/50 focus:bg-white transition-colors shadow-sm text-lg"
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
                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Trier par :</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="rounded-full border-gray-200 h-10 px-6 gap-2 min-w-[160px] justify-between font-medium hover:bg-gray-50">
                                    {sortBy}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={() => setSortBy("Nom")}>Nom</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy("Sport")}>Sport</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy("Ville")}>Ville</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Clubs Grid */}
            <main className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : displayedClubs.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Aucun club trouvé.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedClubs.map((club) => (
                            <ClubCard
                                key={club.id}
                                id={club.id}
                                name={club.name}
                                category={club.category === 'club' ? 'Club Sportif' : (club.category || 'Club')}
                                location={club.address || "Lieu non précisé"}
                                logo={club.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tennis_ball.svg/1024px-Tennis_ball.svg.png"} // Fallback logo
                                color="#F97316" // Default orange color
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Clubs;
