import { Calendar, MapPin, Users } from "lucide-react";

interface EventCardProps {
  title: string;
  date: string;
  price: string;
  location: string;
  participants: string;
  image: string;
}

export const EventCard = ({ title, date, price, location, participants, image }: EventCardProps) => {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-2xl">
      {/* Image Section */}
      <div className={`aspect-[4/3] ${image} relative rounded-2xl mb-4 group-hover:scale-[1.02] transition-transform duration-300`}>
        <div className="absolute top-4 right-4">
          <div className="bg-background/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
            <span className="text-lg font-bold text-primary">{price}</span>
          </div>
        </div>
        <div className="absolute top-4 left-4">
          <div className="bg-background/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
            <span className="text-sm font-medium">{date}</span>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-xl group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{participants} participants</span>
          </div>
        </div>
      </div>
    </div>
  );
};