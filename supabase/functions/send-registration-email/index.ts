import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  participantName: string;
  participantEmail: string;
  activityTitle: string;
  activityDescription: string;
  activityLocation: string;
  activityDate: string;
  activityEndDate: string | null;
}

function generateICSContent(activity: {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const uid = `${Date.now()}@ajos.nl`;
  const now = new Date();

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AJOS//Activiteiten//NL
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(activity.startDate)}
DTEND:${formatDate(activity.endDate)}
SUMMARY:${activity.title}
DESCRIPTION:${activity.description.replace(/\n/g, '\\n')}
LOCATION:${activity.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-registration-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      participantName,
      participantEmail,
      activityTitle,
      activityDescription,
      activityLocation,
      activityDate,
      activityEndDate,
    }: RegistrationEmailRequest = await req.json();

    console.log("Sending registration email to:", participantEmail);

    const startDate = new Date(activityDate);
    const endDate = activityEndDate ? new Date(activityEndDate) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    const icsContent = generateICSContent({
      title: activityTitle,
      description: activityDescription,
      location: activityLocation,
      startDate,
      endDate,
    });

    // Base64 encode the ICS content
    const icsBase64 = btoa(unescape(encodeURIComponent(icsContent)));

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

    const emailResponse = await resend.emails.send({
      from: "AJOS <onboarding@resend.dev>",
      to: [participantEmail],
      subject: `Bevestiging: Je bent ingeschreven voor ${activityTitle}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hoi ${participantName}!</h1>
          <p>Je bent succesvol ingeschreven voor <strong>${activityTitle}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #555;">Activiteit Details</h2>
            <p><strong>📅 Wanneer:</strong> ${formatDate(startDate)}</p>
            ${activityEndDate ? `<p><strong>🏁 Tot:</strong> ${formatDate(endDate)}</p>` : ''}
            <p><strong>📍 Waar:</strong> ${activityLocation}</p>
            <p><strong>📝 Beschrijving:</strong> ${activityDescription}</p>
          </div>

          <p>We sturen je een herinnering voordat de activiteit begint!</p>
          
          <p style="margin-top: 30px;">Tot dan!</p>
          <p><strong>Het AJOS Team</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `${activityTitle.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
          content: icsBase64,
        },
      ],
    });

    console.log("Registration email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending registration email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
