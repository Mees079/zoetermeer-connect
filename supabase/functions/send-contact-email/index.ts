import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contact-email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();
    
    console.log("Received contact form submission from:", email);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "AJOS Contact <onboarding@resend.dev>",
      to: ["info@oncparkdreef.nl"],
      subject: `Nieuw contactbericht van ${name}`,
      html: `
        <h1>Nieuw contactbericht</h1>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Bericht:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation email to sender
    const confirmationEmailResponse = await resend.emails.send({
      from: "AJOS <onboarding@resend.dev>",
      to: [email],
      subject: "Bedankt voor je bericht!",
      html: `
        <h1>Bedankt voor je bericht, ${name}!</h1>
        <p>We hebben je bericht ontvangen en zullen zo snel mogelijk reageren.</p>
        <p><strong>Je bericht:</strong></p>
        <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
        <p>Met vriendelijke groet,<br>Het AJOS Team</p>
      `,
    });

    console.log("Confirmation email sent:", confirmationEmailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Emails verzonden!" }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
