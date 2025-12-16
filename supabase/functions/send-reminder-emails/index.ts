import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-reminder-emails function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find activities starting in the next hour that haven't had reminders sent
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .gte('date', now.toISOString())
      .lte('date', oneHourFromNow.toISOString());

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      throw activitiesError;
    }

    console.log(`Found ${activities?.length || 0} activities starting soon`);

    let emailsSent = 0;

    for (const activity of activities || []) {
      // Get participants who have email and haven't received reminder
      const { data: participants, error: participantsError } = await supabase
        .from('activity_participants')
        .select('*')
        .eq('activity_id', activity.id)
        .not('participant_email', 'is', null)
        .eq('reminder_sent', false);

      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        continue;
      }

      console.log(`Found ${participants?.length || 0} participants to remind for ${activity.title}`);

      const startDate = new Date(activity.date);
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('nl-NL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      };

      for (const participant of participants || []) {
        try {
          await resend.emails.send({
            from: "AJOS <onboarding@resend.dev>",
            to: [participant.participant_email],
            subject: `Herinnering: ${activity.title} begint binnenkort!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Hoi ${participant.participant_name}!</h1>
                <p>Dit is een herinnering dat <strong>${activity.title}</strong> binnenkort begint!</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <p><strong>📅 Start:</strong> ${formatDate(startDate)}</p>
                  <p><strong>📍 Locatie:</strong> ${activity.location}</p>
                </div>

                <p>We zien je daar!</p>
                <p><strong>Het AJOS Team</strong></p>
              </div>
            `,
          });

          // Mark reminder as sent
          await supabase
            .from('activity_participants')
            .update({ reminder_sent: true })
            .eq('id', participant.id);

          emailsSent++;
          console.log(`Reminder sent to ${participant.participant_email}`);
        } catch (emailError) {
          console.error(`Error sending reminder to ${participant.participant_email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-reminder-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
