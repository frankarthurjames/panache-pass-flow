import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { EventLikeButton } from "@/components/EventLikeButton";

interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  price: string;
  location: string;
  participants: string;
  image?: string;
}

export const EventCard = ({ id = "1", title, date, price, location, participants, image }: EventCardProps) => {
  return (
    <Link to={`/events/${id}`} className="block">
      <div className="group cursor-pointer overflow-hidden rounded-2xl">
        {/* Image Section */}
        <div className="aspect-[4/3] relative rounded-2xl mb-4 group-hover:scale-[1.02] transition-transform duration-300 shadow-md group-hover:shadow-lg overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-primary/40" />
            </div>
          )}
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
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-xl group-hover:text-primary transition-colors leading-tight flex-1">
              {title}
            </h3>
            {id && (
              <div onClick={(e) => e.preventDefault()}>
                <EventLikeButton eventId={id} />
              </div>
            )}
          </div>
          
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
    </Link>
  );
};