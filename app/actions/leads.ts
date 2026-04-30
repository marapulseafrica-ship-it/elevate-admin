"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const STATUS_CYCLE: Record<string, string> = {
  new: "contacted",
  contacted: "booked",
  booked: "closed",
  closed: "new",
};

export async function cycleLeadStatus(id: string, currentStatus: string) {
  const next = STATUS_CYCLE[currentStatus] ?? "new";
  const { error } = await db()
    .from("elevate_leads")
    .update({ status: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
}
