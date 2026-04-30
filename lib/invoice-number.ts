import { createClient } from "@supabase/supabase-js";

export async function generateInvoiceNumber(): Promise<string> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const year = new Date().getFullYear();
  const { data } = await client
    .from("elevate_invoices")
    .select("id")
    .gte("issued_at", `${year}-01-01`);
  const seq = String((data?.length ?? 0) + 1).padStart(3, "0");
  return `INV-${year}-${seq}`;
}
