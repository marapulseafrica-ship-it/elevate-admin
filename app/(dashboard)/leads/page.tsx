export const dynamic = "force-dynamic";

import { getLeads } from "@/lib/queries/leads";
import { Card } from "@/components/ui/card";
import { LeadsTable } from "@/components/leads/leads-table";
import { FunnelStats } from "@/components/leads/funnel-stats";

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
      <FunnelStats leads={leads} />
      <Card className="p-0 overflow-hidden">
        <LeadsTable leads={leads} />
      </Card>
    </div>
  );
}
