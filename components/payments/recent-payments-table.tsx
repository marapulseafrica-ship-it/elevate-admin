"use client";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

export function RecentPaymentsTable({ payments }: { payments: any[] }) {
  if (payments.length === 0) {
    return <p className="px-5 py-6 text-sm text-slate-400 text-center">No processed payments yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
            <th className="text-left font-medium px-5 py-3">Restaurant</th>
            <th className="text-left font-medium px-5 py-3">Plan</th>
            <th className="text-left font-medium px-5 py-3">Amount</th>
            <th className="text-left font-medium px-5 py-3">Tx ID</th>
            <th className="text-left font-medium px-5 py-3">Status</th>
            <th className="text-left font-medium px-5 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
              <td className="px-5 py-3">
                <p className="text-sm font-medium text-slate-800">{p.restaurants?.name}</p>
                <p className="text-xs text-slate-400">{p.restaurants?.email}</p>
              </td>
              <td className="px-5 py-3 text-sm capitalize text-slate-600">{p.plan}</td>
              <td className="px-5 py-3 text-sm font-semibold text-slate-800">
                {p.amount_zmw ? `ZMW ${Number(p.amount_zmw).toFixed(0)}` : `$${p.amount_usd}`}
              </td>
              <td className="px-5 py-3 text-xs font-mono text-slate-600">{p.customer_tx_id ?? "—"}</td>
              <td className="px-5 py-3">
                {p.status === "completed"
                  ? <span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>
                  : <span className="flex items-center gap-1 text-xs text-red-500 font-semibold"><XCircle className="w-3.5 h-3.5" /> Rejected</span>
                }
              </td>
              <td className="px-5 py-3 text-xs text-slate-500">
                {format(new Date(p.completed_at ?? p.created_at), "d MMM yyyy")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
