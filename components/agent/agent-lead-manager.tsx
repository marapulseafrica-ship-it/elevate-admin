"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Plus, Phone } from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  contacted: "bg-blue-100 text-blue-700",
  interested: "bg-yellow-100 text-yellow-700",
  free_trial: "bg-purple-100 text-purple-700",
  activated: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-600",
};

export function AgentLeadManager({ agentId, leads }: { agentId: string; leads: any[] }) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  // Add lead
  const [showAdd, setShowAdd] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Log call
  const [callLeadId, setCallLeadId] = useState<string | null>(null);
  const [callType, setCallType] = useState("cold_call");
  const [outcome, setOutcome] = useState("no_answer");
  const [notes, setNotes] = useState("");
  const [callLoading, setCallLoading] = useState(false);

  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAddError("Not logged in"); setAddLoading(false); return; }

    const { error } = await supabase.from("agent_leads").insert({
      agent_id: agentId,
      restaurant_name: restaurantName.trim(),
      location: location.trim() || null,
      contact_person: contactPerson.trim() || null,
      phone: phone.trim() || null,
      month: thisMonth,
    });

    if (error) { setAddError(error.message); setAddLoading(false); return; }

    setRestaurantName(""); setLocation(""); setContactPerson(""); setPhone("");
    setShowAdd(false);
    router.refresh();
    setAddLoading(false);
  }

  async function handleLogCall(e: React.FormEvent) {
    e.preventDefault();
    if (!callLeadId) return;
    setCallLoading(true);

    const { error } = await supabase.from("agent_calls").insert({
      agent_id: agentId,
      lead_id: callLeadId,
      call_type: callType,
      outcome,
      notes: notes.trim() || null,
    });

    if (!error) {
      setCallLeadId(null); setNotes(""); setCallType("cold_call"); setOutcome("no_answer");
      router.refresh();
    }
    setCallLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* My leads table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">My Restaurants ({leads.length}/25)</h2>
          {leads.length < 25 && (
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Restaurant
            </button>
          )}
        </div>

        {/* Add form */}
        {showAdd && (
          <form onSubmit={handleAddLead} className="border-b bg-purple-50 px-5 py-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Restaurant Name *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" placeholder="e.g. Lusaka CBD" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contact Person</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" placeholder="Manager name" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" placeholder="+260..." value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            {addError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{addError}</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={addLoading} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-2 rounded-lg font-medium disabled:opacity-50">
                {addLoading ? "Adding…" : "Add Restaurant"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {/* Leads list */}
        {leads.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No restaurants yet. Add your first one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                  <th className="text-left font-medium px-5 py-3">Restaurant</th>
                  <th className="text-left font-medium px-5 py-3">Calls</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-left font-medium px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-slate-800">{lead.restaurant_name}</div>
                      <div className="text-xs text-slate-400">{lead.location ?? "—"} · {lead.contact_person ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold">{lead.qualified_calls ?? 0}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[lead.status] ?? ""}`}>
                        {lead.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setCallLeadId(callLeadId === lead.id ? null : lead.id)}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        <Phone className="w-3 h-3" /> Log Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log call form */}
      {callLeadId && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Log Qualified Call — {leads.find(l => l.id === callLeadId)?.restaurant_name}
          </h3>
          <form onSubmit={handleLogCall} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Call Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={callType} onChange={e => setCallType(e.target.value)}>
                  <option value="cold_call">Cold Call</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="demo">Demo</option>
                  <option value="closing">Closing</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Outcome</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={outcome} onChange={e => setOutcome(e.target.value)}>
                  <option value="no_answer">No Answer</option>
                  <option value="voicemail">Voicemail</option>
                  <option value="spoke_to_dm">Spoke to DM</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="callback_scheduled">Callback Scheduled</option>
                  <option value="demo_scheduled">Demo Scheduled</option>
                  <option value="free_trial_started">Free Trial Started</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={callLoading} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-2 rounded-lg font-medium disabled:opacity-50">
                {callLoading ? "Saving…" : "Save Call"}
              </button>
              <button type="button" onClick={() => setCallLeadId(null)} className="text-xs text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
