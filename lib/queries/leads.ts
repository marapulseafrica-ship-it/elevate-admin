import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getLeads() {
  noStore();
  const { data } = await db()
    .from("elevate_leads")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getNewLeadsCount() {
  noStore();
  const { data } = await db()
    .from("elevate_leads")
    .select("id")
    .eq("status", "new");
  return data?.length ?? 0;
}
