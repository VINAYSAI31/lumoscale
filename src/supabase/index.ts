import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body: ContactEmailRequest = await req.json();

    const toEmail = "lumoscale@gmail.com";

    const html = `
      <h2>New Contact Submission</h2>
      <ul>
        <li><strong>Name:</strong> ${body.name ?? ""}</li>
        <li><strong>Email:</strong> ${body.email ?? ""}</li>
        <li><strong>Phone:</strong> ${body.phone ?? ""}</li>
        <li><strong>Company:</strong> ${body.company ?? ""}</li>
        <li><strong>Service:</strong> ${body.service ?? ""}</li>
        <li><strong>Message:</strong> ${body.message ?? ""}</li>
      </ul>
      <p>Submitted via Contact Form</p>
    `;

    const emailResult = await resend.emails.send({
      from: "Lumoscale Contact <onboarding@resend.dev>",
      to: [toEmail],
      subject: "New Contact Form Submission",
      html,
    });

    return new Response(JSON.stringify({ status: "sent", result: emailResult }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message ?? "Unknown error" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
