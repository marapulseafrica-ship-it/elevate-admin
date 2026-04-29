import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await supabaseAdmin.from("restaurants").update({
    subscription_status: "active",
    subscription_expires_at: expiresAt.toISOString(),
  }).eq("id", params.id);

  return NextResponse.json({ success: true });
}
