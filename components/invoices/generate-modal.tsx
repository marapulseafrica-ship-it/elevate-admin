"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PLANS = ["starter", "basic", "pro", "premium"];
const PLAN_PRICES: Record<string, number> = { starter: 15, basic: 25, pro: 45, premium: 80 };

export function GenerateModal({ restaurants }: { restaurants: { id: string; name: string; email: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    restaurantId: "",
    plan: "basic",
    amount_usd: "25",
    amount_zmw: "",
    notes: "",
    due_at: "",
  });

  function handlePlanChange(plan: string) {
    const usd = PLAN_PRICES[plan] ?? 25;
    const zmwRate = Number(process.env.NEXT_PUBLIC_ZMW_PER_USD ?? 27);
    setForm((f) => ({ ...f, plan, amount_usd: String(usd), amount_zmw: String(usd * zmwRate) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.restaurantId) return;
    setSaving(true);
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: form.restaurantId,
        plan: form.plan,
        amount_usd: parseFloat(form.amount_usd),
        amount_zmw: form.amount_zmw ? parseFloat(form.amount_zmw) : undefined,
        notes: form.notes || undefined,
        due_at: form.due_at || undefined,
      }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) return (
    <Button onClick={() => setOpen(true)} size="sm">+ Generate Invoice</Button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-slate-800">Generate Invoice</h3>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Restaurant</label>
            <select
              required
              value={form.restaurantId}
              onChange={(e) => setForm((f) => ({ ...f, restaurantId: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Select restaurant…</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {PLANS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Due date</label>
              <input
                type="date"
                value={form.due_at}
                onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount_usd}
                onChange={(e) => setForm((f) => ({ ...f, amount_usd: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Amount (ZMW)</label>
              <input
                type="number"
                step="1"
                value={form.amount_zmw}
                onChange={(e) => setForm((f) => ({ ...f, amount_zmw: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>Generate</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
