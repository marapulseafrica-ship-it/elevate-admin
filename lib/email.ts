import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: { filename: string; content: Buffer }[]
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email to", to);
    return;
  }
  try {
    const result = await resend.emails.send({
      from: "Elevate CRM <onboarding@resend.dev>",
      to,
      subject,
      html,
      attachments,
    });
    if ((result as any).error) {
      console.error("Resend error:", (result as any).error);
    }
  } catch (e) {
    console.error("Email send error:", e);
  }
}
