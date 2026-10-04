"use client";

import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  approved: "bg-blue-50 text-blue-700 border border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export function AgentPayoutsTable({ payouts }: { payouts: any[] }) {
  if (payouts.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-400">
        No payouts yet. They are generated automatically at the end of each month.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
            <th className="text-left font-medium px-6 py-3">Month</th>
            <th className="text-left font-medium px-6 py-3">Agent</th>
            <th className="text-right font-medium px-6 py-3">Activity Fee</th>
            <th className="text-right font-medium px-6 py-3">Bonuses</th>
            <th className="text-right font-medium px-6 py-3">Commission</th>
            <th className="text-right font-medium px-6 py-3">Total</th>
            <th className="text-left font-medium px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p: any) => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
              <td className="px-6 py-3 text-sm font-medium text-slate-800">
                {format(new Date(p.month), "MMMM yyyy")}
              </td>
              <td className="px-6 py-3 text-sm text-slate-600">{p.agent_name}</td>
              <td className="px-6 py-3 text-sm text-right text-slate-700">
                K{Number(p.activity_fee ?? 0).toFixed(0)}
              </td>
              <td className="px-6 py-3 text-sm text-right text-amber-600">
                K{Number(p.conversion_bonus ?? 0).toFixed(0)}
              </td>
              <td className="px-6 py-3 text-sm text-right text-purple-600">
                K{Number(p.commission_total ?? 0).toFixed(0)}
              </td>
              <td className="px-6 py-3 text-sm text-right font-bold text-slate-800">
                K{Number(p.total ?? 0).toFixed(0)}
              </td>
              <td className="px-6 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    statusStyles[p.status] ?? "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
