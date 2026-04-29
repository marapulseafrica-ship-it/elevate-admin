import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateInvoiceNumber } from "@/lib/invoice-number";

export async function POST(req: NextRequest) {
  const { restaurantId, plan, amount_usd, amount_zmw, notes, due_at } = await req.json();

  if (!restaurantId || !plan || !amount_usd) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const invoice_number = await generateInvoiceNumber();

  const { data, error } = await supabaseAdmin
    .from("elevate_invoices")
    .insert({
      restaurant_id: restaurantId,
      invoice_number,
      plan,
      amount_usd,
      amount_zmw: amount_zmw ?? null,
      notes: notes ?? null,
      due_at: due_at ?? null,
      status: "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
