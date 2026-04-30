"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Building2, UserPlus } from "lucide-react";
import { createInvoice } from "@/app/actions/invoices";
import { toast } from "sonner";

const PLANS = ["starter", "basic", "pro", "premium", "setup_fee"];
const PLAN_PRICES: Record<string, number> = { starter: 15, basic: 25, pro: 45, premium: 80, setup_fee: 50 };
const PLAN_LABELS: Record<string, string> = {
  starter: "Starter", basic: "Basic", pro: "Pro", premium: "Premium", setup_fee: "Setup Fee (one-time)",
};
const ZMW_RATE = Number(process.env.NEXT_PUBLIC_ZMW_PER_USD ?? 27);

type ClientMode = "existing" | "external";

export function GenerateModal({ restaurants }: { restaurants: { id: string; name: string; email: string }[] }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientMode, setClientMode] = useState<ClientMode>("existing");
  const [form, setForm] = useState({
    restaurantId: "",
    clientName: "",
    clientEmail: "",
    plan: "basic",
    amount_usd: "25",
    amount_zmw: String(25 * ZMW_RATE),
    notes: "",
    due_at: "",
  });

  function handlePlanChange(plan: string) {
    const usd = PLAN_PRICES[plan] ?? 25;
    setForm((f) => ({ ...f, plan, amount_usd: String(usd), amount_zmw: String(usd * ZMW_RATE) }));
  }

  function handleModeChange(mode: ClientMode) {
    setClientMode(mode);
    setError(null);
    setForm((f) => ({ ...f, restaurantId: "", clientName: "", clientEmail: "" }));
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setClientMode("existing");
    setForm({ restaurantId: "", clientName: "", clientEmail: "", plan: "basic", amount_usd: "25", amount_zmw: String(25 * ZMW_RATE), notes: "", due_at: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (clientMode === "existing" && !form.restaurantId) {
      setError("Please select a restaurant.");
      return;
    }
    if (clientMode === "external" && !form.clientName.trim()) {
      setError("Please enter the client name.");
      return;
    }
    if (!form.amount_usd || Number(form.amount_usd) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const invoiceNumber = await createInvoice({
        restaurantId: clientMode === "existing" ? form.restaurantId : undefined,
        clientName: clientMode === "external" ? form.clientName.trim() : undefined,
        clientEmail: clientMode === "external" ? form.clientEmail.trim() : undefined,
        plan: form.plan,
        amount_usd: parseFloat(form.amount_usd),
        amount_zmw: form.amount_zmw ? parseFloat(form.amount_zmw) : undefined,
        notes: form.notes || undefined,
        due_at: form.due_at || undefined,
      });
      toast.success(`Invoice ${invoiceNumber} created`);
      handleClose();
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate invoice.");
      setSaving(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)} size="sm">+ Generate Invoice</Button>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-slate-800">Generate Invoice</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Client type toggle */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-2">Bill to</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleModeChange("existing")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  clientMode === "existing"
                    ? "bg-purple-50 border-purple-400 text-purple-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Existing restaurant
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("external")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  clientMode === "external"
                    ? "bg-purple-50 border-purple-400 text-purple-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                External client
              </button>
            </div>
          </div>

          {/* Existing restaurant selector */}
          {clientMode === "existing" && (
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Restaurant *</label>
              <select
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
          )}

          {/* External client fields */}
          {clientMode === "external" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Client / Business name *</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  placeholder="e.g. Lusaka Grill House"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                  placeholder="client@example.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          )}

          {/* Plan + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>{PLAN_LABELS[p] ?? p}</option>
                ))}
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

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Amount (USD) *</label>
              <input
                type="number" step="0.01" min="0.01" required
                value={form.amount_usd}
                onChange={(e) => setForm((f) => ({ ...f, amount_usd: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Amount (ZMW)</label>
              <input
                type="number" step="1" min="0"
                value={form.amount_zmw}
                onChange={(e) => setForm((f) => ({ ...f, amount_zmw: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. April subscription"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>Generate</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
