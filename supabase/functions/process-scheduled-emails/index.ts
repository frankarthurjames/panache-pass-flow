import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        console.log("Checking for scheduled emails to process...");

        const now = new Date();

        // 1. Process REMINDERS (events starting in 1h)
        // Between now and 75 minutes from now
        const reminderWindowStart = new Date(now.getTime());
        const reminderWindowEnd = new Date(now.getTime() + 75 * 60000);

        const { data: reminderRegistrations, error: reminderError } = await supabaseClient
            .from("registrations")
            .select(`
        id,
        user_id,
        event_id,
        users (display_name, email),
        events (
          id, 
          title, 
          starts_at, 
          venue, 
          city,
          organizations (name)
        )
      `)
            .is("reminder_sent_at", null)
            .eq("status", "issued")
            .gte("events.starts_at", reminderWindowStart.toISOString())
            .lte("events.starts_at", reminderWindowEnd.toISOString());

        if (reminderError) {
            console.error("Error fetching reminder registrations:", reminderError);
        } else if (reminderRegistrations && reminderRegistrations.length > 0) {
            console.log(`Processing ${reminderRegistrations.length} reminders...`);

            for (const reg of reminderRegistrations) {
                try {
                    const startDate = new Date(reg.events.starts_at);

                    await supabaseClient.functions.invoke("send-brevo-email", {
                        body: {
                            to: reg.users.email,
                            templateKey: "reminder",
                            params: {
                                userName: reg.users.display_name || reg.users.email.split('@')[0],
                                eventTitle: reg.events.title,
                                eventDate: startDate.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                                eventTime: startDate.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }),
                                eventVenue: reg.events.venue || "En ligne",
                                eventCity: reg.events.city || "",
                                ticketsCount: 1, // Logic could be improved to group tickets per order
                                organizerName: reg.events.organizations?.name || "L'organisateur"
                            }
                        }
                    });

                    await supabaseClient
                        .from("registrations")
                        .update({ reminder_sent_at: new Date().toISOString() })
                        .eq("id", reg.id);

                    console.log(`Reminder sent for registration ${reg.id}`);
                } catch (e) {
                    console.error(`Failed to send reminder for ${reg.id}:`, e);
                }
            }
        }

        // 2. Process THANK YOU emails (events ended in the last 24h)
        const thanksWindowEnd = new Date(now.getTime());
        const thanksWindowStart = new Date(now.getTime() - 24 * 60 * 60000);

        const { data: thanksRegistrations, error: thanksError } = await supabaseClient
            .from("registrations")
            .select(`
        id,
        user_id,
        event_id,
        users (display_name, email),
        events (
          id, 
          title, 
          ends_at,
          organizations (name)
        )
      `)
            .is("thanks_sent_at", null)
            .eq("status", "issued")
            .gte("events.ends_at", thanksWindowStart.toISOString())
            .lte("events.ends_at", thanksWindowEnd.toISOString());

        if (thanksError) {
            console.error("Error fetching thanks registrations:", thanksError);
        } else if (thanksRegistrations && thanksRegistrations.length > 0) {
            console.log(`Processing ${thanksRegistrations.length} thank you emails...`);

            for (const reg of thanksRegistrations) {
                try {
                    await supabaseClient.functions.invoke("send-brevo-email", {
                        body: {
                            to: reg.users.email,
                            templateKey: "thanks",
                            params: {
                                userName: reg.users.display_name || reg.users.email.split('@')[0],
                                eventTitle: reg.events.title,
                                organizerName: reg.events.organizations?.name || "L'organisateur",
                                feedbackUrl: "https://panache-esport.com/feedback"
                            }
                        }
                    });

                    await supabaseClient
                        .from("registrations")
                        .update({ thanks_sent_at: new Date().toISOString() })
                        .eq("id", reg.id);

                    console.log(`Thank you email sent for registration ${reg.id}`);
                } catch (e) {
                    console.error(`Failed to send thanks for ${reg.id}:`, e);
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            processed: {
                reminders: reminderRegistrations?.length || 0,
                thanks: thanksRegistrations?.length || 0
            }
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Error in process-scheduled-emails:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
