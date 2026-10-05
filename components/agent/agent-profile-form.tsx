"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const PAYMENT_METHODS = [
  { value: "airtel_money",   label: "Airtel Money" },
  { value: "mtn_momo",      label: "MTN MoMo" },
  { value: "bank_transfer",  label: "Bank Transfer" },
];

export function AgentProfileForm({ agent }: { agent: any }) {
  const supabase = createSupabaseBrowser();
  const [form, setForm] = useState({
    full_name: agent.full_name ?? "",
    phone: agent.phone ?? "",
    nrc_number: agent.nrc_number ?? "",
    address: agent.address ?? "",
    payment_method: agent.payment_method ?? "",
    payment_details: agent.payment_details ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: err } = await supabase
      .from("sales_agents")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        nrc_number: form.nrc_number.trim() || null,
        address: form.address.trim() || null,
        payment_method: form.payment_method || null,
        payment_details: form.payment_details.trim() || null,
      })
      .eq("id", agent.id);

    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl border p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700">Personal Details</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="+260..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">NRC Number</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="123456/78/9" value={form.nrc_number} onChange={e => setForm(f => ({ ...f, nrc_number: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Lusaka, Zambia" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Payment Method</h2>
        <p className="text-xs text-slate-500 mb-3">How would you like to receive your monthly payments?</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment Method</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
              <option value="">Select method</option>
              {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {form.payment_method === "bank_transfer" ? "Account Number / Bank" : "Mobile Number"}
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={form.payment_method === "bank_transfer" ? "Account no. / Bank name" : "+260..."}
              value={form.payment_details}
              onChange={e => setForm(f => ({ ...f, payment_details: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {error && <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-semibold transition-colors">
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
      </div>
    </form>
  );
}
