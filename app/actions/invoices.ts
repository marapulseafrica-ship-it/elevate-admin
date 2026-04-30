"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { generateInvoiceNumber } from "@/lib/invoice-number";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function markInvoicePaid(invoiceId: string) {
  const { error } = await db()
    .from("elevate_invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
  revalidatePath("/invoices");
}

export async function sendInvoice(invoiceId: string) {
  // Just mark as sent — email is handled separately in the API route
  const { error } = await db()
    .from("elevate_invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
  revalidatePath("/invoices");
}

export async function createInvoice(payload: {
  restaurantId: string;
  plan: string;
  amount_usd: number;
  amount_zmw?: number;
  notes?: string;
  due_at?: string;
}) {
  const invoice_number = await generateInvoiceNumber();

  const { error } = await db()
    .from("elevate_invoices")
    .insert({
      restaurant_id: payload.restaurantId,
      invoice_number,
      plan: payload.plan,
      amount_usd: payload.amount_usd,
      amount_zmw: payload.amount_zmw ?? null,
      notes: payload.notes ?? null,
      due_at: payload.due_at ?? null,
      status: "draft",
    });

  if (error) throw new Error(error.message);
  revalidatePath("/invoices");
  return invoice_number;
}
