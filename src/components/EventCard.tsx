
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  id: string | number;
  title: string;
  date: string;
  location: string;
  image: string;
  tag: string;
  tagColor: string;
  price?: string;
}

export const EventCard = ({ id, title, date, location, image, tag, tagColor, price }: EventCardProps) => {
  return (
    <Link
      to={`/events/${id}`}
      className="group relative aspect-[3/2] overflow-hidden rounded-xl bg-muted block shadow-sm hover:shadow-md transition-shadow"
    >
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Overlay gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Tag top left */}
      <div className="absolute top-4 left-4">
        <Badge className={`${tagColor} hover:${tagColor} text-white border-0 rounded-md px-3 py-1 text-sm font-medium`}>
          {tag}
        </Badge>
      </div>

      {/* Content bottom left */}
      <div className="absolute inset-x-0 bottom-4 px-4 text-white flex justify-between items-end">
        <div className="max-w-[70%]">
          <h3 className="text-xl font-bold leading-tight mb-1 truncate">
            {title.replace(/^\[.*?\]\s*/, '')}
          </h3>
          <p className="text-sm text-white/90">
            {date} - {location}
          </p>
        </div>
        {price && (
          <div className="bg-orange-500 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg whitespace-nowrap mb-1">
            {price}
          </div>
        )}
      </div>
    </Link>
  );
};