export const dynamic = 'force-dynamic';

import { supabaseAdmin } from "@/lib/supabase";
import { getRestaurantStats } from "@/lib/queries/restaurants";
import { getRevenueData } from "@/lib/queries/finance";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "@/components/overview/revenue-chart";
import { PlanDonut } from "@/components/overview/plan-donut";
import { Building2, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default async function OverviewPage() {
  const [stats, revenue] = await Promise.all([
    getRestaurantStats(),
    getRevenueData(),
  ]);

  const { data: pendingPayments } = await supabaseAdmin
    .from("payments")
    .select("*, restaurants(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: expiringSoon } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, email, subscription_tier, subscription_expires_at")
    .eq("subscription_status", "active")
    .gte("subscription_expires_at", new Date().toISOString())
    .lte("subscription_expires_at", new Date(Date.now() + 14 * 86400000).toISOString())
    .order("subscription_expires_at", { ascending: true });

  const statCards = [
    { label: "Active Restaurants", value: stats.active, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "MRR", value: formatCurrency(revenue.mrr), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Approvals", value: revenue.pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Expiring in 7 days", value: stats.expiringSoon, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your Elevate CRM business at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">{s.label}</span>
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800">{s.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Revenue (USD)</h3>
          <RevenueChart data={revenue.chartData} />
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Restaurants by Plan</h3>
          <PlanDonut byTier={stats.byTier} />
        </Card>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending payments */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Pending Payments</h3>
            <Badge variant="medium">{revenue.pendingCount} pending</Badge>
          </div>
          <div className="divide-y">
            {(pendingPayments ?? []).length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400 text-center">No pending payments</p>
            )}
            {(pendingPayments ?? []).map((p: any) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.restaurants?.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{p.plan} plan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {p.amount_zmw ? `ZMW ${Number(p.amount_zmw).toFixed(0)}` : `$${p.amount_usd}`}
                  </p>
                  <p className="text-xs text-slate-400">{format(new Date(p.created_at), "d MMM")}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Expiring soon */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="text-sm font-semibold text-slate-700">Expiring in 14 Days</h3>
          </div>
          <div className="divide-y">
            {(expiringSoon ?? []).length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-400 text-center">No subscriptions expiring soon</p>
            )}
            {(expiringSoon ?? []).map((r: any) => {
              const days = differenceInDays(new Date(r.subscription_expires_at), new Date());
              return (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.name}</p>
                    <Badge variant={r.subscription_tier}>{r.subscription_tier}</Badge>
                  </div>
                  <span className={`text-xs font-semibold ${days <= 3 ? "text-red-500" : "text-amber-500"}`}>
                    {days === 0 ? "Today" : `${days}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
