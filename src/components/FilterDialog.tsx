import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";

interface FilterDialogProps {
  onFiltersChange: (filters: any) => void;
}

export const FilterDialog = ({ onFiltersChange }: FilterDialogProps) => {
  const [filters, setFilters] = useState({
    sport: "",
    location: "",
    priceMin: "",
    priceMax: "",
    date: ""
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update active filters
    const active = Object.entries(newFilters)
      .filter(([_, v]) => v !== "")
      .map(([k, _]) => k);
    setActiveFilters(active);
    
    onFiltersChange(newFilters);
  };

  const clearFilter = (key: string) => {
    handleFilterChange(key, "");
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      sport: "",
      location: "",
      priceMin: "",
      priceMax: "",
      date: ""
    };
    setFilters(emptyFilters);
    setActiveFilters([]);
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="flex items-center gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrer les événements</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sport">Sport</Label>
              <Select value={filters.sport} onValueChange={(value) => handleFilterChange("sport", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tennis">Tennis de table</SelectItem>
                  <SelectItem value="marathon">Marathon</SelectItem>
                  <SelectItem value="badminton">Badminton</SelectItem>
                  <SelectItem value="cyclisme">Cyclisme</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Ville</Label>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paris">Paris</SelectItem>
                  <SelectItem value="lyon">Lyon</SelectItem>
                  <SelectItem value="marseille">Marseille</SelectItem>
                  <SelectItem value="nice">Nice</SelectItem>
                  <SelectItem value="bordeaux">Bordeaux</SelectItem>
                  <SelectItem value="strasbourg">Strasbourg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="priceMin">Prix min (€)</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="priceMax">Prix max (€)</Label>
                <Input 
                  type="number" 
                  placeholder="100"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date">Période</Label>
              <Select value={filters.date} onValueChange={(value) => handleFilterChange("date", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cette-semaine">Cette semaine</SelectItem>
                  <SelectItem value="ce-mois">Ce mois</SelectItem>
                  <SelectItem value="prochains-3-mois">3 prochains mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFilters.length > 0 && (
              <Button variant="outline" onClick={clearAllFilters} className="w-full">
                Effacer tous les filtres
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filterKey) => (
            <Badge key={filterKey} variant="secondary" className="flex items-center gap-1">
              {filterKey === "sport" && `Sport: ${filters.sport}`}
              {filterKey === "location" && `Ville: ${filters.location}`}
              {filterKey === "priceMin" && `Prix min: ${filters.priceMin}€`}
              {filterKey === "priceMax" && `Prix max: ${filters.priceMax}€`}
              {filterKey === "date" && `Période: ${filters.date}`}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => clearFilter(filterKey)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};