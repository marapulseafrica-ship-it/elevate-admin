import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { count, error } = await supabaseAdmin
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const result = error ? 0 : (count ?? 0);

  return NextResponse.json(
    { count: result },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
