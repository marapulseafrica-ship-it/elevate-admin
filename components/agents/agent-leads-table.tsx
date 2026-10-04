"use client";

import { format } from "date-fns";

const statusColor: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  contacted: "bg-blue-100 text-blue-700",
  interested: "bg-yellow-100 text-yellow-700",
  free_trial: "bg-purple-100 text-purple-700",
  activated: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-600",
};

export function AgentLeadsTable({ leads }: { leads: any[] }) {
  if (leads.length === 0) {
    return <div className="px-6 py-10 text-center text-sm text-slate-400">No leads yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px]">
        <thead>
          <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
            <th className="text-left font-medium px-6 py-3">Restaurant</th>
            <th className="text-left font-medium px-6 py-3">Agent</th>
            <th className="text-left font-medium px-6 py-3">Month</th>
            <th className="text-left font-medium px-6 py-3">Calls</th>
            <th className="text-left font-medium px-6 py-3">Contact</th>
            <th className="text-left font-medium px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead: any) => (
            <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
              <td className="px-6 py-3">
                <div className="text-sm font-medium text-slate-800">{lead.restaurant_name}</div>
                <div className="text-xs text-slate-400">{lead.location ?? "—"}</div>
              </td>
              <td className="px-6 py-3 text-sm text-slate-600">{lead.agent_name}</td>
              <td className="px-6 py-3 text-sm text-slate-600">{format(new Date(lead.month), "MMM yyyy")}</td>
              <td className="px-6 py-3 text-sm font-semibold">{lead.qualified_calls}</td>
              <td className="px-6 py-3">
                <div className="text-xs text-slate-700">{lead.contact_person ?? "—"}</div>
                <div className="text-xs text-slate-400">{lead.phone ?? "—"}</div>
              </td>
              <td className="px-6 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[lead.status] ?? ""}`}>
                  {lead.status.replace(/_/g, " ")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
