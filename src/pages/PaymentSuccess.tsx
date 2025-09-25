import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

type OrderItem = {
  qty: number;
  unit_price_cents: number;
  ticket_types: { name: string };
};

type OrderData = {
  id: string;
  status: "pending" | "paid" | string;
  created_at: string;
  total_cents: number;
  subtotal_cents?: number;
  platform_fee_cents?: number;
  user_id: string;
  event_id: string;
  events: {
    id: string;
    title: string;
    starts_at: string;
    venue?: string | null;
    city?: string | null;
  };
  order_items: OrderItem[];
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const { data: order, error } = await supabase
          .from("orders")
          .select(`
            *,
            events (
              id,
              title,
              starts_at,
              venue,
              city
            ),
            order_items (
              qty,
              unit_price_cents,
              ticket_types (
                name
              )
            )
          `)
          .eq("id", orderId)
          .single();

        if (error) throw error;
        setOrderData(order as OrderData);

        // Si la commande est encore pending après redirection Stripe, tenter la finalisation
        if ((order as OrderData).status === "pending" && sessionId) {
          await finalizeOrder(orderId, sessionId);
        }
      } catch (err) {
        console.error("Error loading order:", err);
        toast.error("Erreur lors du chargement de la commande");
      } finally {
        setLoading(false);
      }
    };
    loadOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, sessionId]);

  const refetchOrder = async (id: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        events (
          id,
          title,
          starts_at,
          venue,
          city
        ),
        order_items (
          qty,
          unit_price_cents,
          ticket_types ( name )
        )
      `)
      .eq("id", id)
      .single();
    if (!error && data) setOrderData(data as OrderData);
  };

  const checkOrderStatus = async (id: string) => {
    const { data: updated, error } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();
    if (!error && updated?.status === "paid") {
      await refetchOrder(id);
      toast.success("Paiement confirmé ! Vos billets ont été envoyés par e-mail.");
    }
  };

  const finalizeOrder = async (id: string, session: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("finalize-order", {
        body: { sessionId: session, orderId: id },
      });
      if (error) throw error as any;
      if (data?.order) {
        setOrderData(data.order as OrderData);
        toast.success("Paiement confirmé ! Vos billets ont été envoyés par e-mail.");
      } else {
        await checkOrderStatus(id);
      }
    } catch (err) {
      console.error("Error finalizing order:", err);
      toast.error("Erreur lors de la confirmation du paiement");
    }
  };

  const handleDownloadReceipt = () => {
    if (!orderData) return;
    try {
      setDownloadingReceipt(true);

      const event = orderData.events;
      const orderDate = new Date(orderData.created_at);
      const eventDate = new Date(event.starts_at);

      const rows = orderData.order_items
        .map(
          (item) => `
          <tr>
            <td>${item.ticket_types.name}</td>
            <td class="text-right">${item.qty}</td>
            <td class="text-right">${(item.unit_price_cents / 100).toFixed(2)}€</td>
            <td class="text-right">${((item.unit_price_cents * item.qty) / 100).toFixed(2)}€</td>
          </tr>`
        )
        .join("");

      const subtotal = (orderData.subtotal_cents ?? orderData.total_cents) / 100;
      const fees = (orderData.platform_fee_cents ?? 0) / 100;
      const totalHT = subtotal + fees;
      const tva = +(totalHT * 0.2).toFixed(2);
      const totalTTC = (orderData.total_cents / 100).toFixed(2);

      const html = `
<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<title>Reçu - ${event.title}</title>
<style>
  :root{
    --accent: hsl(25 95% 55%);
    --accent-hover: hsl(25 95% 45%);
    --text: hsl(224 71% 4%);
    --sub: hsl(220 9% 46%);
    --line: hsl(220 13% 91%);
    --soft: hsl(25 95% 95%);
  }
  *{ box-sizing:border-box; }
  body{
    font-family: Arial, Helvetica, sans-serif;
    margin:0; padding:32px;
    color:var(--text); background:#fff;
  }
  .header{
    text-align:center; padding-bottom:20px; margin-bottom:28px;
    border-bottom:2px solid var(--accent);
  }
  .brand{ font-weight:800; letter-spacing:.2px; color:var(--accent); }
  .title{ font-size:22px; font-weight:700; margin-top:6px; }
  .meta{
    display:flex; gap:24px; flex-wrap:wrap; margin:22px 0 28px;
  }
  .meta .block{ min-width:240px; }
  .label{ font-size:12px; color:var(--accent); font-weight:700; letter-spacing:.5px; text-transform:uppercase; margin-bottom:6px; }
  .val{ font-size:14px; color:var(--text); }

  .event{
    background:var(--soft); padding:18px; border-radius:10px; margin-bottom:24px;
    border:1px solid hsl(25 95% 85%);
  }
  .event .name{ font-size:16px; font-weight:700; margin-bottom:8px; }
  .grid{ display:flex; gap:16px; flex-wrap:wrap; }
  .grid .col{ min-width:180px; font-size:14px; color:var(--text); }

  table{
    width:100%; border-collapse:collapse; margin:10px 0 24px;
  }
  th, td{
    padding:12px 8px; border-bottom:1px solid var(--line); font-size:14px;
  }
  th{
    text-align:left; background:hsl(220 14% 96%); color:var(--accent); font-weight:700;
  }
  .text-right{ text-align:right; }

  .totals{ margin-top:8px; padding-top:16px; border-top:2px solid var(--accent); }
  .line{ display:flex; justify-content:space-between; margin:6px 0; font-size:14px; }
  .final{
    font-weight:800; font-size:18px; color:var(--accent);
    border-top:1px solid var(--line); padding-top:10px; margin-top:10px;
  }

  .footer{
    text-align:center; margin-top:36px; padding-top:18px; border-top:1px solid var(--line);
    color:var(--sub); font-size:12px;
  }
  @media print{
    body{ padding:0; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">Panache</div>
    <div class="title">Reçu de paiement</div>
  </div>

  <div class="meta">
    <div class="block">
      <div class="label">Commande</div>
      <div class="val">#${orderData.id.slice(-8).toUpperCase()}</div>
      <div class="val">Le ${orderDate.toLocaleDateString("fr-FR")} à ${orderDate.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
      <div class="val" style="margin-top:6px; font-weight:700; color:var(--accent)">Payé</div>
    </div>
    <div class="block">
      <div class="label">Client</div>
      <div class="val">${orderData.user_id || "Client"}</div>
    </div>
  </div>

  <div class="event">
    <div class="name">${event.title}</div>
    <div class="grid">
      <div class="col"><strong>Date</strong><br/>${eventDate.toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      <div class="col"><strong>Heure</strong><br/>${eventDate.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
      <div class="col"><strong>Lieu</strong><br/>${event.venue || "À confirmer"}${event.city ? `, ${event.city}` : ""}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Type de billet</th>
        <th class="text-right">Quantité</th>
        <th class="text-right">Prix unitaire</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals">
    <div class="line"><span>Sous-total HT :</span><span>${subtotal.toFixed(2)}€</span></div>
    ${fees ? `<div class="line"><span>Frais de plateforme HT :</span><span>${fees.toFixed(2)}€</span></div>` : ""}
    <div class="line"><span>Total HT :</span><span>${totalHT.toFixed(2)}€</span></div>
    <div class="line"><span>TVA (20%) :</span><span>${tva.toFixed(2)}€</span></div>
    <div class="line final"><span>Total TTC :</span><span>${totalTTC}€</span></div>
  </div>

  <div class="footer">
    Merci d'avoir choisi Panache. Ce reçu confirme votre inscription à l'événement.
  </div>
</body>
</html>`;

      const w = window.open("", "_blank");
      if (!w) {
        toast.error("Impossible d'ouvrir la fenêtre d'impression");
      } else {
        w.document.write(html);
        w.document.close();
        w.focus();
        w.onload = () => w.print();
        toast.success("Reçu généré ! Utilisez Ctrl/Cmd+P pour imprimer.");
      }
    } catch (e) {
      console.error("Error generating receipt:", e);
      toast.error("Erreur lors de la génération du reçu");
    } finally {
      setDownloadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background px-4 py-4">
          <Logo size="md" />
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Confirmation de votre paiement…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background px-4 py-4">
          <Logo size="md" />
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Commande introuvable</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Impossible de trouver les détails de votre commande.
              </p>
              <Button asChild className="w-full">
                <Link to="/">Retour à l&apos;accueil</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const event = orderData.events;
  const totalTickets = orderData.order_items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background px-4 py-4">
        <Logo size="md" />
      </header>

      <div className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center space-y-1">
              <div className="text-xs font-semibold tracking-widest text-primary">
                PAIEMENT CONFIRMÉ
              </div>
              <CardTitle className="text-2xl text-foreground">
                Merci, votre inscription est confirmée
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Vos billets PDF ont été envoyés par e-mail.
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Événement */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Détails de l&apos;événement
                </h3>
                <div className="rounded-lg p-4 bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold text-base mb-2 text-foreground">
                    {event.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="font-semibold text-primary">Date</div>
                      <div className="text-[13px] text-foreground">
                        {new Date(event.starts_at).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-primary">Heure</div>
                      <div className="text-[13px] text-foreground">
                        {new Date(event.starts_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-primary">Lieu</div>
                      <div className="text-[13px] text-foreground">
                        {[event.venue, event.city].filter(Boolean).join(", ") || "À confirmer"}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Billets */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Vos billets
                </h3>
                <div className="space-y-2">
                  {orderData.order_items.map((item, idx) => {
                    const total = (item.unit_price_cents * item.qty) / 100;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg px-4 py-3 bg-muted/20 border border-border"
                      >
                        <div className="font-medium text-foreground">
                          {item.ticket_types.name}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">x{item.qty}</div>
                          <div className="text-xs text-muted-foreground">
                            {(item.unit_price_cents / 100).toFixed(2)}€ • Total {total.toFixed(2)}€
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Total */}
              <section className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold text-foreground">
                  <span>Total payé</span>
                  <span>{(orderData.total_cents / 100).toFixed(2)}€</span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">
                  {totalTickets} billet{totalTickets > 1 ? "s" : ""}
                </p>
              </section>

              {/* Actions */}
              <section className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild className="flex-1 font-semibold">
                  <Link to={`/events/${event.id}`}>Voir l&apos;événement</Link>
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 font-semibold border-primary text-primary hover:bg-primary/10"
                  onClick={handleDownloadReceipt}
                  disabled={downloadingReceipt}
                >
                  {downloadingReceipt ? "Génération…" : "Télécharger le reçu"}
                </Button>
              </section>

              <p className="text-center text-sm text-muted-foreground">
                Conservez vos billets et présentez-les à l'entrée de l'événement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;