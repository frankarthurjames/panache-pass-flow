import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

export const EventTicketList = ({ 
  events, 
  expandedEvents, 
  toggleEventDetails, 
  getEventStatus,
  formatDate,
  renderOrderDetails,
  type = "upcoming" 
}: any) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-2xl bg-white mt-6">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {type === "upcoming" ? "Aucun événement à venir" : "Aucun événement passé"}
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          {type === "upcoming" 
            ? "Vous n'avez pas d'événements prévus prochainement." 
            : "Vous n'avez participé à aucun événement."}
        </p>
        <Button asChild className="rounded-xl bg-black text-white hover:bg-black/90 font-semibold h-12 px-6">
          <Link to="/events">Découvrir les événements</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 mt-6">
      {events.map((eventGroup: any, eventIndex: number) => {
        const event = eventGroup.event;
        const eventStatus = getEventStatus(event);
        const totalTickets = eventGroup.orders.reduce((sum: number, order: any) => sum + order.registrations.length, 0);
        const isExpanded = expandedEvents[event.id];

        return (
          <Card key={eventIndex} className="overflow-hidden rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-all bg-white">
            <div 
              className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
              onClick={() => toggleEventDetails(event.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {event.title}
                  </h3>
                  <Badge variant="secondary" className={`${eventStatus.color} text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border-0`}>
                    {eventStatus.label}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium mt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{formatDate(event.starts_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="truncate max-w-[200px]">{event.venue}, {event.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>{totalTickets} billet{totalTickets > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100 text-gray-700 font-semibold" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/events/${event.id}`}>Voir l'événement</Link>
                </Button>
                <div className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50/30 p-6 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-6">
                  {eventGroup.orders.map((order: any, orderIndex: number) => renderOrderDetails(order, orderIndex))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
