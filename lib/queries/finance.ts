import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "../supabase";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export async function getRevenueData() {
  noStore();
  // Last 12 months of completed payments
  const since = subMonths(new Date(), 12).toISOString();
  const { data: payments } = await supabaseAdmin
    .from("payments")
    .select("amount_usd, amount_zmw, plan, completed_at, created_at")
    .eq("status", "completed")
    .gte("completed_at", since)
    .order("completed_at", { ascending: true });

  // Group by month
  const monthMap: Record<string, { month: string; revenue: number; count: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const key = format(d, "yyyy-MM");
    monthMap[key] = { month: format(d, "MMM yy"), revenue: 0, count: 0 };
  }
  for (const p of payments ?? []) {
    const key = format(new Date(p.completed_at ?? p.created_at), "yyyy-MM");
    if (monthMap[key]) {
      monthMap[key].revenue += Number(p.amount_usd);
      monthMap[key].count += 1;
    }
  }

  // MRR = this month's revenue
  const thisMonthKey = format(new Date(), "yyyy-MM");
  const mrr = monthMap[thisMonthKey]?.revenue ?? 0;

  // Revenue by tier
  const tierRevenue: Record<string, number> = { starter: 0, basic: 0, pro: 0, premium: 0 };
  for (const p of payments ?? []) {
    if (p.plan in tierRevenue) tierRevenue[p.plan] += Number(p.amount_usd);
  }

  // Pending payments count + amount
  const { data: pending } = await supabaseAdmin
    .from("payments")
    .select("amount_usd, amount_zmw")
    .eq("status", "pending");
  const pendingTotal = (pending ?? []).reduce((s, p) => s + Number(p.amount_usd), 0);

  return {
    chartData: Object.values(monthMap),
    mrr,
    arr: mrr * 12,
    tierRevenue,
    pendingCount: pending?.length ?? 0,
    pendingTotal,
    totalRevenue: (payments ?? []).reduce((s, p) => s + Number(p.amount_usd), 0),
  };
}

export async function getExpenses() {
  noStore();
  const { data } = await supabaseAdmin
    .from("elevate_expenses")
    .select("*")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function addExpense(expense: { category: string; description: string; amount_usd: number; date: string }) {
  return supabaseAdmin.from("elevate_expenses").insert(expense);
}

export async function deleteExpense(id: string) {
  return supabaseAdmin.from("elevate_expenses").delete().eq("id", id);
}
