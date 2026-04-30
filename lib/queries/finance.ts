import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { subMonths, format } from "date-fns";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getRevenueData() {
  noStore();
  const since = subMonths(new Date(), 12).toISOString();

  const [{ data: payments }, { data: setupInvoices }] = await Promise.all([
    // Subscription payments (via Airtel payment flow)
    db()
      .from("payments")
      .select("amount_usd, plan, completed_at, created_at")
      .eq("status", "completed")
      .gte("completed_at", since)
      .order("completed_at", { ascending: true }),

    // Setup fees (via manual invoices)
    db()
      .from("elevate_invoices")
      .select("amount_usd, plan, paid_at, issued_at")
      .eq("status", "paid")
      .eq("plan", "setup_fee")
      .gte("paid_at", since),
  ]);

  // Build month buckets for last 12 months
  const monthMap: Record<string, { month: string; subscriptions: number; setup_fees: number; total: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const key = format(d, "yyyy-MM");
    monthMap[key] = { month: format(d, "MMM yy"), subscriptions: 0, setup_fees: 0, total: 0 };
  }

  for (const p of payments ?? []) {
    const key = format(new Date(p.completed_at ?? p.created_at), "yyyy-MM");
    if (monthMap[key]) {
      monthMap[key].subscriptions += Number(p.amount_usd);
      monthMap[key].total += Number(p.amount_usd);
    }
  }
  for (const inv of setupInvoices ?? []) {
    const key = format(new Date(inv.paid_at ?? inv.issued_at), "yyyy-MM");
    if (monthMap[key]) {
      monthMap[key].setup_fees += Number(inv.amount_usd);
      monthMap[key].total += Number(inv.amount_usd);
    }
  }

  // MRR = this month subscriptions only (setup fees are one-time, excluded from MRR)
  const thisMonthKey = format(new Date(), "yyyy-MM");
  const mrr = monthMap[thisMonthKey]?.subscriptions ?? 0;

  // Revenue by tier (subscriptions)
  const tierRevenue: Record<string, number> = { starter: 0, basic: 0, pro: 0, premium: 0, setup_fee: 0 };
  for (const p of payments ?? []) {
    if (p.plan in tierRevenue) tierRevenue[p.plan] += Number(p.amount_usd);
  }
  for (const inv of setupInvoices ?? []) {
    tierRevenue.setup_fee += Number(inv.amount_usd);
  }

  // Also include non-setup paid invoices (manually billed subscriptions)
  const { data: otherInvoices } = await db()
    .from("elevate_invoices")
    .select("amount_usd, plan, paid_at, issued_at")
    .eq("status", "paid")
    .neq("plan", "setup_fee")
    .gte("paid_at", since);

  for (const inv of otherInvoices ?? []) {
    const key = format(new Date(inv.paid_at ?? inv.issued_at), "yyyy-MM");
    if (monthMap[key]) {
      monthMap[key].subscriptions += Number(inv.amount_usd);
      monthMap[key].total += Number(inv.amount_usd);
    }
    if (inv.plan in tierRevenue) tierRevenue[inv.plan] += Number(inv.amount_usd);
  }

  // Pending payments
  const { data: pending } = await db()
    .from("payments")
    .select("amount_usd")
    .eq("status", "pending");
  const pendingTotal = (pending ?? []).reduce((s, p) => s + Number(p.amount_usd), 0);

  const allPaymentsTotal = (payments ?? []).reduce((s, p) => s + Number(p.amount_usd), 0);
  const allInvoicesTotal = [...(setupInvoices ?? []), ...(otherInvoices ?? [])].reduce((s, i) => s + Number(i.amount_usd), 0);

  return {
    chartData: Object.values(monthMap),
    mrr,
    arr: mrr * 12,
    tierRevenue,
    pendingCount: pending?.length ?? 0,
    pendingTotal,
    totalRevenue: allPaymentsTotal + allInvoicesTotal,
    totalSetupFees: tierRevenue.setup_fee,
  };
}

export async function getExpenses() {
  noStore();
  const { data } = await db()
    .from("elevate_expenses")
    .select("*")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function addExpense(expense: { category: string; description: string; amount_usd: number; date: string }) {
  return db().from("elevate_expenses").insert(expense);
}

export async function deleteExpense(id: string) {
  return db().from("elevate_expenses").delete().eq("id", id);
}
