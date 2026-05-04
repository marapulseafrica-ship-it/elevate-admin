"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const LOGO = `
<div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
  <svg viewBox="0 0 60 50" width="44" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect x="4"  y="30" width="10" height="16" rx="2" fill="#b0b8e8"/>
    <rect x="20" y="20" width="10" height="26" rx="2" fill="#b0b8e8"/>
    <rect x="36" y="8"  width="10" height="38" rx="2" fill="#ffffff"/>
  </svg>
  <div>
    <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">ElevateAI</div>
    <div style="font-size:9px;color:#b0b8e8;letter-spacing:3px;text-transform:uppercase;margin-top:1px;">Solutions Limited</div>
  </div>
</div>`;

function buildReplyEmail(toName: string, replyMessage: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 16px;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,26,53,0.10);">
      <tr><td style="background:linear-gradient(135deg,#0a1a35 0%,#1a3a6e 100%);padding:28px 36px 24px;">${LOGO}</td></tr>
      <tr><td style="background:#ffffff;padding:36px 36px 28px;">
        <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0a1a35;">Hi ${toName.split(' ')[0]},</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">Thank you for reaching out to ElevateAI Solutions Limited. Here's our response to your inquiry:</p>
        <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:28px;">
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.8;white-space:pre-wrap;">${replyMessage}</p>
        </div>
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Need more help?</p>
          <a href="mailto:elevateaisolutionsagency@gmail.com" style="font-size:13px;color:#2563eb;font-weight:600;">elevateaisolutionsagency@gmail.com</a>
          <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">— The ElevateAI Solutions Limited Team</p>
        </div>
      </td></tr>
      <tr><td style="background:#0a1a35;padding:20px 36px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#b0b8e8;">© 2026 ElevateAI Solutions Limited · Lusaka, Zambia</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const BOOKING_CYCLE: Record<string, string> = {
  new:       "contacted",
  contacted: "booked",
  booked:    "won",
  won:       "new",
  lost:      "new",
};

const INQUIRY_CYCLE: Record<string, string> = {
  new:    "closed",
  closed: "new",
};

export async function markLeadLost(id: string) {
  const { error } = await db()
    .from("elevate_leads")
    .update({ status: "lost" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
}

export async function replyToLead(id: string, replyMessage: string) {
  const supabase = db();
  const { data: lead, error } = await supabase
    .from("elevate_leads")
    .select("name, email")
    .eq("id", id)
    .single();
  if (error || !lead) throw new Error("Lead not found");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const html = buildReplyEmail(lead.name, replyMessage);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "ElevateAI Solutions Limited <support@elevateaisolutionsagency.com>",
      to: [lead.email],
      subject: "Re: Your Inquiry — ElevateAI Solutions Limited",
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Email failed: ${text}`);
  }

  await supabase.from("elevate_leads").update({ status: "contacted" }).eq("id", id);
  revalidatePath("/leads");
}

export async function cycleLeadStatus(id: string, currentStatus: string, type: string) {
  const cycle = type === "contact" ? INQUIRY_CYCLE : BOOKING_CYCLE;
  const next = cycle[currentStatus] ?? "new";
  const { error } = await db()
    .from("elevate_leads")
    .update({ status: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
}
