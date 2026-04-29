import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await supabaseAdmin.from("elevate_expenses").delete().eq("id", params.id);
  return NextResponse.json({ success: true });
}
