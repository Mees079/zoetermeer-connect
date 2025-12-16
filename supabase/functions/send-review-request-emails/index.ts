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
  console.log("send-review-request-emails function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();

    // Find activities that have ended (end_date is in the past or date + 2 hours if no end_date)
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*');

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      throw activitiesError;
    }

    // Filter activities that have ended
    const endedActivities = (activities || []).filter(activity => {
      const endDate = activity.end_date 
        ? new Date(activity.end_date) 
        : new Date(new Date(activity.date).getTime() + 2 * 60 * 60 * 1000);
      return now > endDate;
    });

    console.log(`Found ${endedActivities.length} ended activities`);

    let emailsSent = 0;

    for (const activity of endedActivities) {
      // Get participants who have email and haven't received review request
      const { data: participants, error: participantsError } = await supabase
        .from('activity_participants')
        .select('*')
        .eq('activity_id', activity.id)
        .not('participant_email', 'is', null)
        .eq('review_request_sent', false);

      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        continue;
      }

      console.log(`Found ${participants?.length || 0} participants to request review for ${activity.title}`);

      // Generate review URL - you'll need to replace this with your actual domain
      const reviewUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/reviews?activity=${activity.id}`;

      for (const participant of participants || []) {
        try {
          await resend.emails.send({
            from: "AJOS <onboarding@resend.dev>",
            to: [participant.participant_email],
            subject: `Hoe was ${activity.title}? Laat een review achter!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Hoi ${participant.participant_name}!</h1>
                <p>We hopen dat je hebt genoten van <strong>${activity.title}</strong>!</p>
                
                <p>We zouden het heel fijn vinden als je een review achterlaat. Dit helpt ons om onze activiteiten te verbeteren.</p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${reviewUrl}" style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    ⭐ Laat een Review Achter
                  </a>
                </div>

                <p>Bedankt voor je deelname!</p>
                <p><strong>Het AJOS Team</strong></p>
              </div>
            `,
          });

          // Mark review request as sent
          await supabase
            .from('activity_participants')
            .update({ review_request_sent: true })
            .eq('id', participant.id);

          emailsSent++;
          console.log(`Review request sent to ${participant.participant_email}`);
        } catch (emailError) {
          console.error(`Error sending review request to ${participant.participant_email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-review-request-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
