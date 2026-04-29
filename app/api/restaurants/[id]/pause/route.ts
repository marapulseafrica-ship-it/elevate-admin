import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  await supabaseAdmin.from("restaurants").update({
    subscription_status: "cancelled",
  }).eq("id", params.id);

  return NextResponse.json({ success: true });
}
