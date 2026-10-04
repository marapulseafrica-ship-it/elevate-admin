"use client";

import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

export function AgentConversionsTable({ conversions }: { conversions: any[] }) {
  if (conversions.length === 0) {
    return <div className="px-6 py-10 text-center text-sm text-slate-400">No conversions yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px]">
        <thead>
          <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
            <th className="text-left font-medium px-6 py-3">Restaurant</th>
            <th className="text-left font-medium px-6 py-3">Agent</th>
            <th className="text-left font-medium px-6 py-3">Trial Started</th>
            <th className="text-left font-medium px-6 py-3">Activated</th>
            <th className="text-left font-medium px-6 py-3">Paid Months</th>
            <th className="text-left font-medium px-6 py-3">Commission Earned</th>
          </tr>
        </thead>
        <tbody>
          {conversions.map((c: any) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
              <td className="px-6 py-3 text-sm font-medium text-slate-800">
                {c.restaurant_name ?? (c.restaurant_id ? `ID: ${c.restaurant_id.slice(0, 8)}…` : "Pending")}
              </td>
              <td className="px-6 py-3 text-sm text-slate-600">{c.agent_name}</td>
              <td className="px-6 py-3 text-sm text-slate-600">
                {format(new Date(c.free_trial_started_at), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-3">
                {c.activated_at ? (
                  <div className="flex items-center gap-1 text-emerald-600 text-sm">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {format(new Date(c.activated_at), "MMM d, yyyy")}
                  </div>
                ) : (
                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Free trial</span>
                )}
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((m) => (
                    <div
                      key={m}
                      className={`w-4 h-4 rounded-sm text-[9px] flex items-center justify-center font-bold ${
                        m <= (c.paid_months ?? 0)
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-300"
                      }`}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-3 text-sm font-semibold text-emerald-600">
                K{Number(c.total_commission_earned).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
