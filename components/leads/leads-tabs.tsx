"use client";

import { useState } from "react";
import { FunnelStats } from "./funnel-stats";
import { LeadsTable } from "./leads-table";

type Lead = {
  id: string; type: string; name: string; email: string;
  phone?: string | null; business_name?: string | null;
  service_type?: string | null; industry?: string | null;
  goals?: string | null; message?: string | null;
  booking_date?: string | null; booking_time?: string | null;
  status: string; created_at: string;
};

const TABS = ["Bookings", "Inquiries"] as const;

export function LeadsTabs({ leads }: { leads: Lead[] }) {
  const [active, setActive] = useState<"Bookings" | "Inquiries">("Bookings");

  const bookings  = leads.filter(l => l.type === "booking");
  const inquiries = leads.filter(l => l.type === "contact");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              active === tab
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              active === tab ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500"
            }`}>
              {tab === "Bookings" ? bookings.length : inquiries.length}
            </span>
          </button>
        ))}
      </div>

      {active === "Bookings" && (
        <>
          <FunnelStats leads={bookings} />
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <LeadsTable leads={bookings} />
          </div>
        </>
      )}

      {active === "Inquiries" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <LeadsTable leads={inquiries} />
        </div>
      )}
    </div>
  );
}
