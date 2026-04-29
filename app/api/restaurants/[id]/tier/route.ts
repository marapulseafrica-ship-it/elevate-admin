import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { subMonths } from "date-fns";

const MONTHS: Record<string, number> = { starter: 3, basic: 1, pro: 1, premium: 1 };

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { tier } = await req.json();
  if (!["starter","basic","pro","premium"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  const months = MONTHS[tier] ?? 1;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);

  await supabaseAdmin.from("restaurants").update({
    subscription_tier: tier,
    subscription_status: "active",
    subscription_expires_at: expiresAt.toISOString(),
  }).eq("id", params.id);

  return NextResponse.json({ success: true });
}
