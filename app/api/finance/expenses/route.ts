import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { category, description, amount_usd, date } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("elevate_expenses")
    .insert({ category, description, amount_usd, date })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
