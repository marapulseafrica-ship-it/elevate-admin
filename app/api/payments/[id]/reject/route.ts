import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { reason } = await req.json().catch(() => ({ reason: undefined }));

  const { error } = await supabaseAdmin
    .from("payments")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      ...(reason ? { flw_tx_ref: `rejected: ${reason}` } : {}),
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
