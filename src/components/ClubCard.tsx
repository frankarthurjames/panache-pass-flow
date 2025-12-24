
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface ClubCardProps {
    id: string | number;
    name: string;
    category: string;
    location: string;
    logo: string;
    color?: string; // Optional color for the left section background
}

export const ClubCard = ({ id, name, category, location, logo, color = "#DC2626" }: ClubCardProps) => {
    return (
        <Link
            to={`/clubs/${id}`}
            className="group flex h-32 overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
            {/* Left Section - Logo & Color */}
            <div
                className="w-1/3 flex items-center justify-center p-4 relative overflow-hidden"
                style={{ backgroundColor: color }}
            >
                {/* Background Pattern/Overlay could go here */}
                <div className="relative z-10 bg-white p-2 rounded-lg shadow-sm">
                    <img
                        src={logo}
                        alt={`${name} logo`}
                        className="h-12 w-12 object-contain"
                    />
                </div>
            </div>

            {/* Right Section - Info */}
            <div className="flex-1 p-4 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {name}
                </h3>

                <div className="flex flex-col gap-2 items-start">
                    <Badge className="bg-orange-500 hover:bg-orange-600 border-0 text-white font-medium px-2 py-0.5 text-xs">
                        {category}
                    </Badge>

                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {location}
                    </div>
                </div>
            </div>
        </Link>
    );
};
