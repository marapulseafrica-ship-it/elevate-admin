import { supabaseAdmin } from "./supabase";

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabaseAdmin
    .from("elevate_invoices")
    .select("id", { count: "exact", head: true })
    .gte("issued_at", `${year}-01-01`);
  const seq = String((count ?? 0) + 1).padStart(3, "0");
  return `INV-${year}-${seq}`;
}
