import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const TIER_MONTHS: Record<string, number> = { starter: 3, basic: 1, pro: 1, premium: 1 };

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  // Get the payment
  const { data: payment, error: fetchError } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchError || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const now = new Date();
  const months = TIER_MONTHS[payment.plan] ?? 1;
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + months);

  // Mark payment as completed
  const { error: paymentError } = await supabaseAdmin
    .from("payments")
    .update({ status: "completed", completed_at: now.toISOString() })
    .eq("id", params.id);

  if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 });

  // Upgrade restaurant subscription
  const { error: restaurantError } = await supabaseAdmin
    .from("restaurants")
    .update({
      subscription_tier: payment.plan,
      subscription_status: "active",
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq("id", payment.restaurant_id);

  if (restaurantError) return NextResponse.json({ error: restaurantError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
