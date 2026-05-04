"use client";
import { useState, useTransition } from "react";
import { format } from "date-fns";
import { X, Calendar, Clock, Building2, Mail, Phone, Tag, MessageSquare, Target, Send, Loader2, ThumbsDown } from "lucide-react";
import { cycleLeadStatus, markLeadLost, replyToLead } from "@/app/actions/leads";

const STATUS_STYLE: Record<string, string> = {
  new:       "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  booked:    "bg-purple-100 text-purple-700",
  won:       "bg-green-100 text-green-700",
  lost:      "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  new:       "New",
  contacted: "Contacted",
  booked:    "Appt. Scheduled",
  won:       "Closed Won",
  lost:      "Closed Lost",
  closed:    "Closed",
};

const TYPE_STYLE: Record<string, string> = {
  contact: "bg-purple-100 text-purple-700",
  booking: "bg-indigo-100 text-indigo-700",
};

type Lead = {
  id: string; type: string; name: string; email: string;
  phone?: string | null; business_name?: string | null;
  service_type?: string | null; industry?: string | null;
  goals?: string | null; message?: string | null;
  booking_date?: string | null; booking_time?: string | null;
  status: string; created_at: string;
};

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-slate-700 break-words">{value}</p>
      </div>
    </div>
  );
}

function StatusButton({ id, status, type }: { id: string; status: string; type: string }) {
  const [isPending, startTransition] = useTransition();
  const [isLostPending, startLost] = useTransition();
  const isBooking = type === "booking";
  const showLostBtn = isBooking && !["won", "lost", "new"].includes(status);
  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => cycleLeadStatus(id, status, type))}
        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-opacity ${STATUS_STYLE[status] ?? ""} ${isPending ? "opacity-50" : "hover:opacity-80 cursor-pointer"}`}
      >
        {STATUS_LABEL[status] ?? status}
      </button>
      {showLostBtn && (
        <button
          disabled={isLostPending}
          onClick={() => startLost(() => markLeadLost(id))}
          title="Mark as Closed Lost"
          className={`p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ${isLostPending ? "opacity-50" : ""}`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);
  const [replyTarget, setReplyTarget] = useState<Lead | null>(null);
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSending, startReply] = useTransition();

  function handleSendReply() {
    if (!replyTarget || !reply.trim()) return;
    setReplyError(null);
    startReply(async () => {
      try {
        await replyToLead(replyTarget.id, reply.trim());
        setReplyTarget(null);
        setReply("");
      } catch (err: unknown) {
        setReplyError(err instanceof Error ? err.message : "Failed to send");
      }
    });
  }

  return (
    <>
      {/* ── Leads table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
              <th className="text-left font-medium px-5 py-3">Name</th>
              <th className="text-left font-medium px-5 py-3">Email</th>
              <th className="text-left font-medium px-5 py-3">Business</th>
              <th className="text-left font-medium px-5 py-3">Type</th>
              <th className="text-left font-medium px-5 py-3">Service / Message</th>
              <th className="text-left font-medium px-5 py-3">Date</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-left font-medium px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <button onClick={() => setSelected(lead)} className="text-sm font-medium text-slate-800 hover:text-blue-600 hover:underline underline-offset-2 text-left transition-colors">
                    {lead.name}
                  </button>
                  {lead.phone && <div className="text-xs text-slate-400 mt-0.5">{lead.phone}</div>}
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">{lead.email}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{lead.business_name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${TYPE_STYLE[lead.type] ?? ""}`}>
                    {lead.type === "contact" ? "inquiry" : lead.type}
                  </span>
                </td>
                <td className="px-5 py-3 max-w-[220px]">
                  {lead.type === "booking" ? (
                    <div className="text-sm text-slate-700">
                      <span className="font-medium">{lead.service_type}</span>
                      {lead.booking_date && <div className="text-xs text-slate-400 mt-0.5">{lead.booking_date} at {lead.booking_time} SAST</div>}
                      {lead.industry && <div className="text-xs text-slate-400">{lead.industry}</div>}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 line-clamp-2">{lead.message}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">{format(new Date(lead.created_at), "d MMM yyyy")}</td>
                <td className="px-5 py-3"><StatusButton id={lead.id} status={lead.status} type={lead.type} /></td>
                <td className="px-5 py-3">
                  <button onClick={() => { setReplyTarget(lead); setReply(""); setReplyError(null); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                    <Send className="w-3 h-3" /> Reply
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">No leads yet — they'll appear here when someone submits the inquiry or booking form</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-800">{selected.name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[selected.status] ?? ""}`}>{STATUS_LABEL[selected.status] ?? selected.status}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {selected.type === "booking" ? "Booking" : "Inquiry"} · {format(new Date(selected.created_at), "d MMM yyyy, h:mm a")}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 ml-4 mt-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5">
              <Field icon={<Mail className="w-4 h-4" />} label="Email" value={selected.email} />
              {selected.phone && <Field icon={<Phone className="w-4 h-4" />} label="Phone" value={selected.phone} />}
              {selected.business_name && <Field icon={<Building2 className="w-4 h-4" />} label="Business" value={selected.business_name} />}
              {selected.industry && <Field icon={<Tag className="w-4 h-4" />} label="Industry" value={selected.industry} />}
              {selected.type === "booking" && <>
                {selected.service_type && <Field icon={<Tag className="w-4 h-4" />} label="Service" value={selected.service_type} />}
                {selected.booking_date && <Field icon={<Calendar className="w-4 h-4" />} label="Date" value={selected.booking_date} />}
                {selected.booking_time && <Field icon={<Clock className="w-4 h-4" />} label="Time" value={`${selected.booking_time} SAST`} />}
              </>}
              {selected.goals && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><Target className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Goals</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.goals}</p>
                  </div>
                </div>
              )}
              {selected.message && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><MessageSquare className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Message</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reply modal ── */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setReplyTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Reply to {replyTarget.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{replyTarget.email}</p>
              </div>
              <button onClick={() => setReplyTarget(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {replyTarget.message && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-h-28 overflow-y-auto">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Their message</p>
                  <p className="text-sm text-slate-500 italic">{replyTarget.message}</p>
                </div>
              )}
              <textarea rows={6} placeholder="Type your reply..." value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" />
              {replyError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">⚠ {replyError}</p>}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setReplyTarget(null)} disabled={isSending} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSendReply} disabled={isSending || !reply.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
