"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Plus, Phone, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "pending",       label: "Not Contacted",  color: "bg-slate-100 text-slate-500" },
  { value: "contacted",     label: "Contacted",       color: "bg-blue-100 text-blue-700" },
  { value: "interested",    label: "Interested",      color: "bg-yellow-100 text-yellow-700" },
  { value: "follow_up",     label: "Follow Up",       color: "bg-orange-100 text-orange-700" },
  { value: "free_trial",    label: "Trial Started",   color: "bg-purple-100 text-purple-700" },
  { value: "activated",     label: "Activated",       color: "bg-emerald-100 text-emerald-700" },
  { value: "lost",          label: "Not Interested",  color: "bg-red-100 text-red-600" },
  { value: "already_client","label": "Already Client",color: "bg-teal-100 text-teal-700" },
];

const CALL_TYPE_OPTIONS = [
  { value: "phone",     label: "Phone Call" },
  { value: "whatsapp",  label: "WhatsApp" },
  { value: "in_person", label: "In Person" },
];

const OUTCOME_OPTIONS = [
  { value: "no_answer",      label: "No Answer" },
  { value: "voicemail",      label: "Voicemail" },
  { value: "spoke_to_dm",    label: "Spoke to Decision Maker" },
  { value: "interested",     label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "callback",       label: "Callback Scheduled" },
  { value: "demo_scheduled", label: "Demo Scheduled" },
  { value: "free_trial",     label: "Free Trial Started" },
  { value: "other",          label: "Other" },
];

const NON_QUALIFYING_OUTCOMES = ["no_answer", "voicemail"];

function statusStyle(value: string) {
  return STATUS_OPTIONS.find(s => s.value === value)?.color ?? "bg-slate-100 text-slate-500";
}
function statusLabel(value: string) {
  return STATUS_OPTIONS.find(s => s.value === value)?.label ?? value;
}

export function RestaurantManager({
  agentId, leads, allClaimed, thisMonth,
}: {
  agentId: string;
  leads: any[];
  allClaimed: any[];
  thisMonth: string;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [, startTransition] = useTransition();

  // Add restaurant form
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", country: "Zambia", city: "", phone: "", contact: "", position: "", notes: "" });

  // Expanded lead (for calls)
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  // Log call form
  const [callLeadId, setCallLeadId] = useState<string | null>(null);
  const [callForm, setCallForm] = useState({ callType: "phone", outcome: "no_answer", personSpokenTo: "", notes: "", followupDate: "" });
  const [callLoading, setCallLoading] = useState(false);

  function checkDuplicate(name: string) {
    if (!name.trim()) { setDupWarning(null); return; }
    const match = allClaimed.find(r => r.restaurant_name.toLowerCase().trim() === name.toLowerCase().trim());
    if (match) {
      setDupWarning(`Already claimed by another agent on ${format(new Date(match.claimed_at), "dd/MM/yyyy")}`);
    } else {
      setDupWarning(null);
    }
  }

  async function handleAddRestaurant(e: React.FormEvent) {
    e.preventDefault();
    if (dupWarning) return;
    setAddLoading(true);
    setAddError(null);

    const location = [form.city, form.country].filter(Boolean).join(", ");

    const { error } = await supabase.from("agent_leads").insert({
      agent_id: agentId,
      restaurant_name: form.name.trim(),
      country: form.country.trim() || null,
      location: location || null,
      phone: form.phone.trim() || null,
      contact_person: form.contact.trim() || null,
      contact_position: form.position.trim() || null,
      notes: form.notes.trim() || null,
      month: thisMonth,
    });

    if (error) { setAddError(error.message); setAddLoading(false); return; }

    setForm({ name: "", country: "Zambia", city: "", phone: "", contact: "", position: "", notes: "" });
    setShowAdd(false);
    startTransition(() => router.refresh());
    setAddLoading(false);
  }

  async function handleStatusChange(leadId: string, newStatus: string) {
    await supabase.from("agent_leads").update({ status: newStatus }).eq("id", leadId);
    startTransition(() => router.refresh());
  }

  async function handleFollowupDate(leadId: string, date: string) {
    await supabase.from("agent_leads").update({ next_followup_date: date || null }).eq("id", leadId);
    startTransition(() => router.refresh());
  }

  async function handleLogCall(e: React.FormEvent) {
    e.preventDefault();
    if (!callLeadId) return;
    setCallLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCallLoading(false); return; }

    const { error } = await supabase.from("agent_calls").insert({
      agent_id: agentId,
      lead_id: callLeadId,
      call_type: callForm.callType,
      outcome: callForm.outcome,
      person_spoken_to: callForm.personSpokenTo.trim() || null,
      notes: callForm.notes.trim() || null,
      next_followup_date: callForm.followupDate || null,
    });

    if (!error) {
      // Update lead status based on outcome
      const outcomeStatusMap: Record<string, string> = {
        interested: "interested",
        free_trial: "free_trial",
        not_interested: "lost",
        callback: "follow_up",
        demo_scheduled: "follow_up",
        spoke_to_dm: "contacted",
      };
      const newStatus = outcomeStatusMap[callForm.outcome];
      if (newStatus) await supabase.from("agent_leads").update({ status: newStatus }).eq("id", callLeadId);

      // Update follow-up date
      if (callForm.followupDate) {
        await supabase.from("agent_leads").update({ next_followup_date: callForm.followupDate }).eq("id", callLeadId);
      }

      setCallLeadId(null);
      setCallForm({ callType: "phone", outcome: "no_answer", personSpokenTo: "", notes: "", followupDate: "" });
      startTransition(() => router.refresh());
    }
    setCallLoading(false);
  }

  const isQualified = !NON_QUALIFYING_OUTCOMES.includes(callForm.outcome);

  return (
    <div className="space-y-4">
      {/* Restaurant table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Restaurant List ({leads.length}/25)</h2>
          {leads.length < 25 && (
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Restaurant
            </button>
          )}
        </div>

        {/* Add form */}
        {showAdd && (
          <form onSubmit={handleAddRestaurant} className="border-b bg-purple-50/60 px-5 py-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Restaurant Name *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); checkDuplicate(e.target.value); }}
                  required
                />
                {dupWarning && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {dupWarning}
                  </div>
                )}
                {!dupWarning && form.name.trim() && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Available — not claimed by another agent
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Lusaka" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="+260..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Manager name" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Position</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Owner / Manager" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            {addError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{addError}</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={addLoading || !!dupWarning} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors">
                {addLoading ? "Adding…" : "Add Restaurant"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {/* Leads list */}
        {leads.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400">
            No restaurants yet this month.<br />
            <span className="text-xs">Add up to 25 restaurants and start logging calls.</span>
          </div>
        ) : (
          <div className="divide-y">
            {leads.map((lead: any) => (
              <div key={lead.id}>
                {/* Lead row */}
                <div className="px-5 py-3.5 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">{lead.restaurant_name}</span>
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-400 ${statusStyle(lead.status)}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-2">
                      {lead.location && <span>{lead.location}</span>}
                      {lead.contact_person && <span>· {lead.contact_person}{lead.contact_position ? ` (${lead.contact_position})` : ""}</span>}
                      {lead.phone && <span>· {lead.phone}</span>}
                      {lead.next_followup_date && <span className="text-orange-500 font-medium">· Follow up: {format(new Date(lead.next_followup_date), "dd MMM")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-xs text-slate-500 font-semibold">{lead.qualified_calls ?? 0} calls</div>
                    <button
                      onClick={() => setCallLeadId(callLeadId === lead.id ? null : lead.id)}
                      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Phone className="w-3 h-3" /> Log Call
                    </button>
                    <button
                      onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {expandedLead === lead.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Inline log call form */}
                {callLeadId === lead.id && (
                  <form onSubmit={handleLogCall} className="border-t bg-blue-50/50 px-5 py-4 space-y-3">
                    <div className="text-xs font-semibold text-blue-800 mb-2">Log Qualified Call</div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Call Type</label>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={callForm.callType} onChange={e => setCallForm(f => ({ ...f, callType: e.target.value }))}>
                          {CALL_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Outcome</label>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={callForm.outcome} onChange={e => setCallForm(f => ({ ...f, outcome: e.target.value }))}>
                          {OUTCOME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Person Spoken To</label>
                        <input className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name / title" value={callForm.personSpokenTo} onChange={e => setCallForm(f => ({ ...f, personSpokenTo: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Next Follow-up Date</label>
                        <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={callForm.followupDate} onChange={e => setCallForm(f => ({ ...f, followupDate: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                        <input className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={callForm.notes} onChange={e => setCallForm(f => ({ ...f, notes: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="submit" disabled={callLoading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors">
                        {callLoading ? "Saving…" : "Save Call"}
                      </button>
                      <button type="button" onClick={() => setCallLeadId(null)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                      {isQualified
                        ? <span className="text-xs text-emerald-600 font-medium">✓ Counts as a qualified call (+1 toward target)</span>
                        : <span className="text-xs text-slate-400">No answer / voicemail — does not count toward target</span>
                      }
                    </div>
                  </form>
                )}

                {/* Expanded call history */}
                {expandedLead === lead.id && (
                  <div className="border-t bg-slate-50 px-5 py-3">
                    {(lead.agent_calls ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400">No calls logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Call History</div>
                        {(lead.agent_calls ?? []).map((call: any) => (
                          <div key={call.id} className="bg-white rounded-lg border px-3 py-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-slate-700 capitalize">{call.call_type?.replace("_", " ")} · {call.outcome?.replace(/_/g, " ")}</span>
                              <span className="text-slate-400">{call.call_date ? format(new Date(call.call_date), "dd MMM, HH:mm") : ""}</span>
                            </div>
                            {call.person_spoken_to && <div className="text-slate-500 mt-0.5">Spoke to: {call.person_spoken_to}</div>}
                            {call.notes && <div className="text-slate-500 mt-0.5">{call.notes}</div>}
                            {call.next_followup_date && <div className="text-orange-500 mt-0.5">Follow up: {format(new Date(call.next_followup_date), "dd MMM yyyy")}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other agents' restaurants */}
      {allClaimed.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b bg-red-50">
            <h2 className="text-sm font-semibold text-red-800">⛔ Restaurants Claimed by Other Agents</h2>
            <p className="text-xs text-red-600 mt-0.5">Do not contact these restaurants — they are already assigned</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                  <th className="text-left font-medium px-5 py-3">Restaurant</th>
                  <th className="text-left font-medium px-5 py-3">Location</th>
                  <th className="text-left font-medium px-5 py-3">Claimed</th>
                </tr>
              </thead>
              <tbody>
                {allClaimed.map((r: any, i: number) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-slate-700">{r.restaurant_name}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{r.location ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">{format(new Date(r.claimed_at), "dd/MM/yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
