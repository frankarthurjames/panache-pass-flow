import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const SearchSection = () => {
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const [searchParams, setSearchParams] = useState({
    sport: "tous",
    region: "toutes", 
    keyword: ""
  });

  // Lire les paramètres de l'URL au chargement
  useEffect(() => {
    const sport = urlSearchParams.get('sport') || "tous";
    const region = urlSearchParams.get('region') || "toutes";
    const keyword = urlSearchParams.get('q') || "";
    
    setSearchParams({
      sport,
      region,
      keyword
    });
  }, [urlSearchParams]);

  const handleSearch = () => {
    // Construire les paramètres de recherche
    const params = new URLSearchParams();
    
    if (searchParams.sport !== "tous") {
      params.append("sport", searchParams.sport);
    }
    if (searchParams.region !== "toutes") {
      params.append("region", searchParams.region);
    }
    if (searchParams.keyword.trim()) {
      params.append("q", searchParams.keyword.trim());
    }

    // Rediriger vers la page des événements avec les paramètres de recherche
    const queryString = params.toString();
    const url = `/events${queryString ? `?${queryString}` : ''}`;
    
    console.log('Recherche lancée:', { searchParams, url });
    navigate(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchParams({
      sport: "tous",
      region: "toutes",
      keyword: ""
    });
    navigate('/events');
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trouve ton prochain{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              événement sportif
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Panache rassemble les tournois et matchs près de chez toi
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-lg border">
            {/* Affichage des filtres actifs */}
            {(searchParams.sport !== "tous" || searchParams.region !== "toutes" || searchParams.keyword) && (
              <div className="mb-6 flex flex-wrap gap-2 items-center justify-center">
                <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                {searchParams.sport !== "tous" && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    Sport: {searchParams.sport}
                  </span>
                )}
                {searchParams.region !== "toutes" && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    Région: {searchParams.region}
                  </span>
                )}
                {searchParams.keyword && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                    Mot-clé: {searchParams.keyword}
                  </span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="text-xs h-6 px-2"
                >
                  Effacer
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Sport</label>
                <Select 
                  value={searchParams.sport} 
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, sport: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Tous les sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="running">Course à pied</SelectItem>
                    <SelectItem value="cyclisme">Cyclisme</SelectItem>
                    <SelectItem value="natation">Natation</SelectItem>
                    <SelectItem value="badminton">Badminton</SelectItem>
                    <SelectItem value="tennis-table">Tennis de table</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Région</label>
                <Select 
                  value={searchParams.region} 
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toutes">Toutes les régions</SelectItem>
                    <SelectItem value="ile-de-france">Île-de-France</SelectItem>
                    <SelectItem value="auvergne-rhone-alpes">Auvergne-Rhône-Alpes</SelectItem>
                    <SelectItem value="paca">Provence-Alpes-Côte d'Azur</SelectItem>
                    <SelectItem value="nouvelle-aquitaine">Nouvelle-Aquitaine</SelectItem>
                    <SelectItem value="occitanie">Occitanie</SelectItem>
                    <SelectItem value="hauts-de-france">Hauts-de-France</SelectItem>
                    <SelectItem value="grand-est">Grand Est</SelectItem>
                    <SelectItem value="pays-de-la-loire">Pays de la Loire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Mot-clé</label>
                <Input 
                  placeholder="Nom, lieu, équipe..." 
                  className="h-12"
                  value={searchParams.keyword}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground invisible">Rechercher</label>
                <Button 
                  size="lg" 
                  className="w-full h-12 text-base"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};