import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

const TIER_MONTHS: Record<string, number> = { starter: 3, basic: 1, pro: 1, premium: 1 };

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  // Fetch payment + restaurant details
  const { data: payment, error: fetchError } = await supabaseAdmin
    .from("payments")
    .select("*, restaurants(name, email)")
    .eq("id", params.id)
    .single();

  if (fetchError || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const now = new Date();
  const months = TIER_MONTHS[payment.plan] ?? 1;
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + months);
  const expiryStr = expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Mark payment as completed
  const { error: payErr } = await supabaseAdmin
    .from("payments")
    .update({ status: "completed", completed_at: now.toISOString() })
    .eq("id", params.id);

  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

  // Upgrade restaurant subscription
  const { error: restErr } = await supabaseAdmin
    .from("restaurants")
    .update({
      subscription_tier: payment.plan,
      subscription_status: "active",
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq("id", payment.restaurant_id);

  if (restErr) return NextResponse.json({ error: restErr.message }, { status: 500 });

  // Email restaurant owner
  const restaurant = (payment as any).restaurants;
  if (restaurant?.email) {
    await sendEmail(
      restaurant.email,
      "Your Elevate CRM subscription is now active ✓",
      `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 16px;">
        <h2 style="color:#1e293b;margin-bottom:4px;">Payment Approved 🎉</h2>
        <p style="color:#64748b;font-size:14px;margin-bottom:20px;">Your payment has been verified and your subscription is now active.</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Restaurant</td><td style="padding:8px 0;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">${restaurant.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Plan activated</td><td style="padding:8px 0;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;text-transform:capitalize;">${payment.plan}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Expires</td><td style="padding:8px 0;font-weight:600;text-align:right;">${expiryStr}</td></tr>
        </table>
        <p style="margin-top:24px;font-size:13px;color:#64748b;">Thank you for your payment. Log in to your dashboard to access all features.</p>
        <p style="font-size:13px;color:#94a3b8;margin-top:16px;">— Elevate CRM Team</p>
      </div>`
    ).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
