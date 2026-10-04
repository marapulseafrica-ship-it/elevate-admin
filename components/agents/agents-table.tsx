"use client";

import { format } from "date-fns";

const statusColor = (active: boolean) =>
  active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500";

export function AgentsTable({ overview, agents }: { overview: any[]; agents: any[] }) {
  if (overview.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-slate-400">
        No agents yet. Share the signup link to onboard your first agent.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
            <th className="text-left font-medium px-6 py-3">Agent</th>
            <th className="text-left font-medium px-6 py-3">This Month</th>
            <th className="text-left font-medium px-6 py-3">Conversions</th>
            <th className="text-left font-medium px-6 py-3">Owed</th>
            <th className="text-left font-medium px-6 py-3">Lifetime</th>
            <th className="text-left font-medium px-6 py-3">Joined</th>
            <th className="text-left font-medium px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {overview.map((row: any) => {
            const agent = agents.find((a) => a.id === row.agent_id);
            return (
              <tr key={row.agent_id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-800">{row.full_name}</div>
                  <div className="text-xs text-slate-400">{row.phone ?? agent?.email ?? "—"}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold">{row.month_calls} calls</div>
                  <div className="text-xs text-slate-400">{row.month_leads} restaurants</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-amber-600">{row.total_conversions}</td>
                <td className="px-6 py-4 text-sm font-bold text-red-600">K{Number(row.unpaid_total).toFixed(0)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">K{Number(row.lifetime_earned).toFixed(0)}</td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {agent?.contract_signed_at
                    ? format(new Date(agent.contract_signed_at), "MMM d, yyyy")
                    : "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(row.is_active)}`}>
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
