import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Euro, Eye, Edit, MoreHorizontal, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";

interface EventCardRowProps {
  event: {
    id: string | number;
    title: string;
    date: string;
    status: string;
    statusColor: string;
    participants: string;
    revenue: string;
    category?: string;
    description?: string;
    venue?: string;
    city?: string;
  };
  orgId: string;
  extraBadge?: ReactNode;
  dropdownItems?: { label: string; onClick: () => void; destructive?: boolean; icon?: ReactNode }[];
  showDescription?: boolean;
}

export const EventCardRow = ({ event, orgId, extraBadge, dropdownItems, showDescription }: EventCardRowProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg truncate">{event.title}</h3>
              <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                <div className={`w-2 h-2 rounded-full ${event.statusColor}`} />
                {event.status}
              </Badge>
              {extraBadge}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {event.date}
                </span>
                {event.venue && (
                  <span className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 text-center">📍</span>
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">
                      {event.venue}{event.city && `, ${event.city}`}
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {event.participants}
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="w-3.5 h-3.5" />
                  {event.revenue}
                </span>
              </div>
              {showDescription && event.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-1 sm:line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0 self-end sm:self-center">
            <Button variant="outline" size="sm" asChild className="gap-1 text-xs sm:text-sm">
              <Link to={`/dashboard/org/${orgId}/events/${event.id}/analytics`}>
                <BarChart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Stats</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to={`/events/${event.id}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to={`/dashboard/org/${orgId}/events/${event.id}/edit`}>
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
            {dropdownItems && dropdownItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {dropdownItems.map((item, i) => (
                    <DropdownMenuItem
                      key={i}
                      onClick={item.onClick}
                      className={item.destructive ? "text-destructive" : ""}
                    >
                      {item.icon}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
