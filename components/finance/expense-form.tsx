"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const CATEGORIES = ["salary", "hosting", "tools", "marketing", "other"];

export function ExpenseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: "hosting", description: "", amount_usd: "", date: new Date().toISOString().slice(0, 10) });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.amount_usd) return;
    setSaving(true);
    await fetch("/api/finance/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount_usd: parseFloat(form.amount_usd) }),
    });
    setSaving(false);
    setOpen(false);
    setForm({ category: "hosting", description: "", amount_usd: "", date: new Date().toISOString().slice(0, 10) });
    router.refresh();
  }

  if (!open) return (
    <Button onClick={() => setOpen(true)} size="sm" className="flex items-center gap-1.5">
      <PlusCircle className="w-3.5 h-3.5" /> Add Expense
    </Button>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="e.g. Vercel hosting plan"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-500 block mb-1">Amount (USD)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.amount_usd}
          onChange={(e) => setForm((f) => ({ ...f, amount_usd: e.target.value }))}
          placeholder="0.00"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" size="sm" loading={saving}>Save Expense</Button>
      </div>
    </form>
  );
}
