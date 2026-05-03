export const dynamic = "force-dynamic";

import { getLeads } from "@/lib/queries/leads";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { LeadStatusButton } from "@/components/leads/lead-status-button";
import { ReplyModal } from "@/components/leads/reply-modal";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";

const STATUS_STYLE: Record<string, string> = {
  new:       "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  booked:    "bg-green-100 text-green-700",
  closed:    "bg-slate-100 text-slate-500",
};

const TYPE_STYLE: Record<string, string> = {
  contact: "bg-purple-100 text-purple-700",
  booking: "bg-indigo-100 text-indigo-700",
};

export default async function LeadsPage() {
  const leads = await getLeads();
  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {leads.length} total · {newCount} new
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
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
                <th className="text-left font-medium px-5 py-3">Reply</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <LeadDetailModal lead={lead} />
                    {lead.phone && <div className="text-xs text-slate-400 mt-0.5">{lead.phone}</div>}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{lead.email}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{lead.business_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${TYPE_STYLE[lead.type] ?? ""}`}>
                      {lead.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 max-w-[220px]">
                    {lead.type === "booking" ? (
                      <div className="text-sm text-slate-700">
                        <span className="font-medium">{lead.service_type}</span>
                        {lead.booking_date && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {lead.booking_date} at {lead.booking_time} SAST
                          </div>
                        )}
                        {lead.industry && <div className="text-xs text-slate-400">{lead.industry}</div>}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 line-clamp-2">{lead.message}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {format(new Date(lead.created_at), "d MMM yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <LeadStatusButton id={lead.id} status={lead.status} styleMap={STATUS_STYLE} />
                  </td>
                  <td className="px-5 py-3">
                    <ReplyModal
                      id={lead.id}
                      name={lead.name}
                      email={lead.email}
                      originalMessage={lead.message}
                    />
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                    No leads yet — they'll appear here when someone submits the contact or booking form
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
