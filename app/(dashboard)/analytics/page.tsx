export const dynamic = 'force-dynamic';

import { getUsageAndChurn, getRetentionSummary } from "@/lib/queries/analytics";
import { Card } from "@/components/ui/card";
import { ChurnTable } from "@/components/analytics/churn-table";
import { Users, TrendingDown, RefreshCw, XCircle } from "lucide-react";

export default async function AnalyticsPage() {
  const [rows, retention] = await Promise.all([getUsageAndChurn(), getRetentionSummary()]);

  const highRisk = rows.filter((r) => r.churnRisk === "High").length;
  const medRisk = rows.filter((r) => r.churnRisk === "Medium").length;
  const lowRisk = rows.filter((r) => r.churnRisk === "Low").length;

  const retCards = [
    { label: "Active", value: retention.active, icon: Users, color: "text-green-500" },
    { label: "Trial", value: retention.trial, icon: RefreshCw, color: "text-blue-500" },
    { label: "Expired", value: retention.expired, icon: TrendingDown, color: "text-amber-500" },
    { label: "Cancelled", value: retention.cancelled, icon: XCircle, color: "text-red-400" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Analytics & Churn</h1>

      {/* Retention summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {retCards.map((c) => (
          <Card key={c.label} className="p-5 flex items-center gap-4">
            <c.icon className={`w-8 h-8 ${c.color}`} />
            <div>
              <p className="text-2xl font-bold text-slate-800">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Risk distribution */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center border-l-4 border-l-green-400">
          <p className="text-3xl font-bold text-green-600">{lowRisk}</p>
          <p className="text-xs text-slate-500 mt-1">Low churn risk</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-amber-400">
          <p className="text-3xl font-bold text-amber-600">{medRisk}</p>
          <p className="text-xs text-slate-500 mt-1">Medium churn risk</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-red-400">
          <p className="text-3xl font-bold text-red-600">{highRisk}</p>
          <p className="text-xs text-slate-500 mt-1">High churn risk</p>
        </Card>
      </div>

      {/* Churn table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-slate-800">Usage & Churn Risk — Last 30 Days</h3>
          <p className="text-xs text-slate-500 mt-0.5">Click column headers to sort</p>
        </div>
        <ChurnTable rows={rows} />
      </Card>
    </div>
  );
}
