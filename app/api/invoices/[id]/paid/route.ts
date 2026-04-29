import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  await supabaseAdmin
    .from("elevate_invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", params.id);

  return NextResponse.json({ success: true });
}
