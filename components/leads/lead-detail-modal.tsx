"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Clock, Building2, Mail, Phone, Tag, MessageSquare, Target } from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  business_name?: string | null;
  service_type?: string | null;
  industry?: string | null;
  goals?: string | null;
  message?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  status: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  new:       "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  booked:    "bg-green-100 text-green-700",
  closed:    "bg-slate-100 text-slate-500",
};

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-slate-700 break-words">{value}</p>
      </div>
    </div>
  );
}

export function LeadDetailModal({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);

  const modal = open ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-slate-800">{lead.name}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[lead.status] ?? ""}`}>
                {lead.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lead.type === "booking" ? "Booking" : "Contact"} · Received {format(new Date(lead.created_at), "d MMM yyyy, h:mm a")}
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors ml-4 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          <Field icon={<Mail className="w-4 h-4" />} label="Email" value={lead.email} />
          {lead.phone && <Field icon={<Phone className="w-4 h-4" />} label="Phone" value={lead.phone} />}
          {lead.business_name && <Field icon={<Building2 className="w-4 h-4" />} label="Business" value={lead.business_name} />}
          {lead.industry && <Field icon={<Tag className="w-4 h-4" />} label="Industry" value={lead.industry} />}

          {lead.type === "booking" && (
            <>
              {lead.service_type && <Field icon={<Tag className="w-4 h-4" />} label="Service" value={lead.service_type} />}
              {lead.booking_date && <Field icon={<Calendar className="w-4 h-4" />} label="Date" value={lead.booking_date} />}
              {lead.booking_time && <Field icon={<Clock className="w-4 h-4" />} label="Time" value={`${lead.booking_time} SAST`} />}
            </>
          )}

          {lead.goals && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Goals</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{lead.goals}</p>
              </div>
            </div>
          )}

          {lead.message && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Message</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{lead.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-slate-800 hover:text-blue-600 transition-colors text-left underline-offset-2 hover:underline"
      >
        {lead.name}
      </button>
      {typeof document !== "undefined" && modal
        ? createPortal(modal, document.body)
        : modal}
    </>
  );
}
