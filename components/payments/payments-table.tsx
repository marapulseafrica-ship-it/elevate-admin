"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle, XCircle, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

export function PaymentsTable({ payments }: { payments: any[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleApprove(id: string) {
    setBusy(id);
    const res = await fetch(`/api/payments/${id}/approve`, { method: "POST" });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) { alert(`Error: ${data.error}`); return; }
    router.refresh();
  }

  async function handleReject(id: string) {
    setBusy(id);
    await fetch(`/api/payments/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason || "Payment could not be verified." }),
    });
    setBusy(null);
    setRejectId(null);
    setRejectReason("");
    router.refresh();
  }

  if (payments.length === 0) {
    return <p className="px-5 py-10 text-sm text-slate-400 text-center">No pending payments</p>;
  }

  return (
    <div className="divide-y">
      {payments.map((p) => {
        const rest = p.restaurants;
        const isBusy = busy === p.id;
        return (
          <div key={p.id} className="p-5 space-y-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{rest?.name}</p>
                  <Link href={`/restaurants/${p.restaurant_id}`} className="text-purple-500 hover:text-purple-700">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-slate-400">{rest?.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-slate-800">
                  {p.amount_zmw ? `ZMW ${Number(p.amount_zmw).toFixed(0)}` : `$${p.amount_usd}`}
                </p>
                {p.amount_zmw && <p className="text-xs text-slate-400">${Number(p.amount_usd).toFixed(2)} USD</p>}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-lg px-4 py-3 text-xs">
              <div>
                <p className="text-slate-400 mb-0.5">Plan</p>
                <p className="font-semibold text-slate-700 capitalize">{p.plan}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">Submitted</p>
                <p className="font-semibold text-slate-700">{format(new Date(p.created_at), "d MMM yyyy, HH:mm")}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">Transaction ID</p>
                <p className="font-semibold text-slate-700 font-mono">{p.customer_tx_id ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">Phone</p>
                <p className="font-semibold text-slate-700">{p.renewal_phone ?? rest?.whatsapp_number ?? "—"}</p>
              </div>
            </div>

            {/* Reject reason input */}
            {rejectId === p.id && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason (optional)"
                  className="flex-1 text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  onClick={() => handleReject(p.id)}
                  disabled={isBusy}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm reject"}
                </button>
                <button onClick={() => setRejectId(null)} className="text-xs text-slate-500 hover:text-slate-700 px-2">
                  Cancel
                </button>
              </div>
            )}

            {/* Action buttons */}
            {rejectId !== p.id && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(p.id)}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                >
                  {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => setRejectId(p.id)}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 text-xs border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 font-semibold"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
