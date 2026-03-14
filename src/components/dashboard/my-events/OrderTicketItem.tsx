import { Ticket, User, QrCode, Download, ExternalLink, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export const OrderTicketItem = ({ order, handleDownloadTicket, handleDownloadInvoice, isDownloadingTickets }: any) => {
  const getTicketStatus = (registration: any) => {
    if (registration.status === 'cancelled') {
      return { label: 'Annulé', className: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (registration.qr_scanned) {
      return { label: 'Scanné', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
    return { label: 'Valide', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900">
            Commande #{order.id.substring(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">
            {order.totalPaid.toFixed(2)}€
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            onClick={() => handleDownloadInvoice(order.id)}
          >
            <Receipt className="w-4 h-4 mr-2" /> Reçu
          </Button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {order.registrations.map((reg: any, i: number) => {
          const status = getTicketStatus(reg);
          return (
            <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {reg.first_name} {reg.last_name}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 pl-6">
                  <span>{reg.ticket_type.name}</span>
                  <span>•</span>
                  <span>{(reg.ticket_type.price_cents / 100).toFixed(2)}€</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pl-6 sm:pl-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-700 border-gray-200 hover:bg-gray-100 bg-white"
                  onClick={() => handleDownloadTicket(reg.id)}
                  disabled={isDownloadingTickets[reg.id] || reg.status === 'cancelled'}
                >
                  {isDownloadingTickets[reg.id] ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Billet
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
