export const dynamic = 'force-dynamic';

import { getRevenueData, getExpenses } from "@/lib/queries/finance";
import { Card } from "@/components/ui/card";
import { ExpenseForm } from "@/components/finance/expense-form";
import { ExpensesList } from "@/components/finance/expenses-list";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";

export default async function FinancePage() {
  const [revenue, expenses] = await Promise.all([getRevenueData(), getExpenses()]);

  const thisMonth = new Date();
  const thisMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === thisMonth.getFullYear() && d.getMonth() === thisMonth.getMonth();
    })
    .reduce((s: number, e: any) => s + Number(e.amount_usd), 0);

  const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount_usd), 0);
  const netProfit = revenue.totalRevenue - totalExpenses;
  const profitMargin = revenue.totalRevenue > 0 ? (netProfit / revenue.totalRevenue) * 100 : 0;

  const totalSubscriptionRevenue = revenue.totalRevenue - revenue.totalSetupFees;

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(revenue.totalRevenue),
      sub: `${formatCurrency(totalSubscriptionRevenue)} subscriptions · ${formatCurrency(revenue.totalSetupFees)} setup fees`,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    { label: "MRR", value: formatCurrency(revenue.mrr), sub: "subscription revenue this month", icon: DollarSign, color: "text-green-500" },
    { label: "Setup Fees", value: formatCurrency(revenue.totalSetupFees), sub: "one-time onboarding revenue", icon: DollarSign, color: "text-amber-500" },
    { label: "Pending payments", value: revenue.pendingCount.toString(), sub: formatCurrency(revenue.pendingTotal) + " awaiting approval", icon: AlertCircle, color: "text-red-400" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Finance</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by tier */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Revenue by Tier</h3>
          <div className="space-y-3">
            {Object.entries(revenue.tierRevenue).map(([tier, amount]) => (
              <div key={tier} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{tier === "setup_fee" ? "Setup Fee" : tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: revenue.totalRevenue > 0 ? `${(amount / revenue.totalRevenue) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 w-16 text-right">{formatCurrency(amount)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between text-sm">
            <span className="text-slate-500">Total revenue</span>
            <span className="font-bold text-slate-800">{formatCurrency(revenue.totalRevenue)}</span>
          </div>
        </Card>

        {/* Profit summary */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Profit Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total revenue</span>
              <span className="font-semibold text-slate-800">{formatCurrency(revenue.totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total expenses</span>
              <span className="font-semibold text-red-500">− {formatCurrency(totalExpenses)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-slate-700">Net profit</span>
              <span className={`font-bold text-lg ${netProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Profit margin</span>
              <span className={`font-semibold ${profitMargin >= 0 ? "text-green-600" : "text-red-500"}`}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Expenses */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Expenses</h3>
            <ExpenseForm />
          </div>
          <div className="max-h-72 overflow-y-auto">
            <ExpensesList expenses={expenses} />
          </div>
        </Card>
      </div>
    </div>
  );
}
