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
      className="group relative aspect-[3/2] overflow-hidden rounded-3xl bg-muted block shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-[0.98]"
    >
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Tag top left */}
      <div className="absolute top-6 left-6">
        <Badge className={`bg-black text-white hover:bg-black/90 border-0 rounded-xl px-4 py-1.5 text-xs font-black tracking-widest uppercase shadow-xl`}>
          {tag}
        </Badge>
      </div>

      {/* Content bottom left */}
      <div className="absolute inset-x-0 bottom-6 px-6 text-white flex justify-between items-end">
        <div className="max-w-[70%]">
          <h3 className="text-2xl font-black leading-tight mb-2 line-clamp-2">
            {title.replace(/^\[.*?\]\s*/, '')}
          </h3>
          <p className="text-sm font-bold text-white/80 uppercase tracking-wider">
            {date} • {location}
          </p>
        </div>
        {price && (
          <div className="bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-base shadow-xl whitespace-nowrap mb-1">
            {price}
          </div>
        )}
      </div>
    </Link>
  );
};
