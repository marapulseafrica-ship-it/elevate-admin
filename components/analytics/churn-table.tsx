"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

type Row = {
  id: string; name: string; email: string; tier: string; status: string;
  campaignsLast30: number; newCustomersLast30: number;
  messagesSent: number; messagesDelivered: number;
  churnScore: number; churnRisk: "Low" | "Medium" | "High";
};

type SortKey = "churnScore" | "campaignsLast30" | "newCustomersLast30" | "messagesSent";

export function ChurnTable({ rows }: { rows: Row[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "churnScore", dir: "desc" });

  function toggle(key: SortKey) {
    setSort((s) => s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" });
  }

  const sorted = [...rows].sort((a, b) => {
    const diff = a[sort.key] - b[sort.key];
    return sort.dir === "asc" ? diff : -diff;
  });

  function SortIcon({ k }: { k: SortKey }) {
    if (sort.key !== k) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sort.dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
  }

  function th(label: string, key: SortKey) {
    return (
      <th
        className="text-left font-medium px-4 py-3 cursor-pointer select-none hover:text-slate-700"
        onClick={() => toggle(key)}
      >
        <div className="flex items-center gap-1">{label}<SortIcon k={key} /></div>
      </th>
    );
  }

  const riskColors: Record<string, string> = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-amber-100 text-amber-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
            <th className="text-left font-medium px-4 py-3">Restaurant</th>
            <th className="text-left font-medium px-4 py-3">Tier / Status</th>
            {th("Campaigns (30d)", "campaignsLast30")}
            {th("New Customers", "newCustomersLast30")}
            {th("Messages Sent", "messagesSent")}
            {th("Churn Risk", "churnScore")}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-slate-800">{r.name}</div>
                <div className="text-xs text-slate-400">{r.email}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <Badge variant={r.tier}>{r.tier}</Badge>
                  <Badge variant={r.status}>{r.status}</Badge>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{r.campaignsLast30}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{r.newCustomersLast30}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{r.messagesSent.toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${riskColors[r.churnRisk]}`}>
                  {r.churnRisk} ({r.churnScore})
                </span>
              </td>
              <td className="px-4 py-3">
                <Link href={`/restaurants/${r.id}`} className="text-purple-600 hover:text-purple-700">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
