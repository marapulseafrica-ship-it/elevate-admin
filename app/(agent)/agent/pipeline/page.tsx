import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const STAGES = [
  { key: "pending",       label: "Prospects",      color: "bg-slate-100 border-slate-300",  dot: "bg-slate-400" },
  { key: "contacted",     label: "Contacted",      color: "bg-blue-50  border-blue-200",    dot: "bg-blue-500" },
  { key: "interested",    label: "Interested",     color: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" },
  { key: "follow_up",     label: "Follow Up",      color: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
  { key: "free_trial",    label: "Trial",          color: "bg-purple-50 border-purple-200", dot: "bg-purple-500" },
  { key: "activated",     label: "Activated",      color: "bg-emerald-50 border-emerald-200",dot: "bg-emerald-500" },
  { key: "lost",          label: "Not Interested", color: "bg-red-50 border-red-200",       dot: "bg-red-400" },
];

export default async function AgentPipelinePage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("id").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const { data: leads } = await supabaseAdmin
    .from("agent_leads")
    .select("id, restaurant_name, location, status, qualified_calls, last_call_at")
    .eq("agent_id", agent.id)
    .order("claimed_at");

  const allLeads = leads ?? [];
  const grouped: Record<string, any[]> = {};
  STAGES.forEach(s => { grouped[s.key] = allLeads.filter(l => l.status === s.key); });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pipeline</h1>
        <p className="text-sm text-slate-500">All-time view of your restaurant funnel</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {STAGES.map(stage => (
          <div key={stage.key} className={`rounded-xl border p-3 text-center ${stage.color}`}>
            <div className="text-2xl font-bold text-slate-800">{grouped[stage.key].length}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">{stage.label}</div>
          </div>
        ))}
      </div>

      {/* Funnel visual */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Sales Funnel</h2>
        <div className="space-y-2">
          {STAGES.filter(s => s.key !== "lost").map((stage, i) => {
            const count = grouped[stage.key].length;
            const total = allLeads.length || 1;
            const width = Math.max((count / total) * 100, count > 0 ? 8 : 0);
            return (
              <div key={stage.key} className="flex items-center gap-3">
                <div className="w-28 text-xs text-slate-500 text-right shrink-0">{stage.label}</div>
                <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg flex items-center px-2 transition-all ${stage.dot.replace("bg-", "bg-")}`}
                    style={{ width: `${width}%`, minWidth: count > 0 ? "2rem" : "0" }}
                  >
                    {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                  </div>
                </div>
                <div className="w-6 text-xs text-slate-400 shrink-0">{count}</div>
              </div>
            );
          })}
        </div>
        {allLeads.filter(l => l.status === "lost").length > 0 && (
          <div className="mt-3 text-xs text-slate-400 text-right">
            + {allLeads.filter(l => l.status === "lost").length} not interested
          </div>
        )}
      </div>

      {/* Per-stage cards */}
      {STAGES.filter(s => grouped[s.key].length > 0).map(stage => (
        <div key={stage.key} className="bg-white rounded-xl border overflow-hidden">
          <div className={`px-5 py-3 border-b flex items-center gap-2 ${stage.color}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
            <h2 className="text-sm font-semibold text-slate-700">{stage.label}</h2>
            <span className="ml-auto text-sm font-bold text-slate-600">{grouped[stage.key].length}</span>
          </div>
          <div className="divide-y">
            {grouped[stage.key].map((lead: any) => (
              <div key={lead.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">{lead.restaurant_name}</div>
                  {lead.location && <div className="text-xs text-slate-400">{lead.location}</div>}
                </div>
                <div className="text-xs text-slate-500">{lead.qualified_calls ?? 0} calls</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {allLeads.length === 0 && (
        <div className="bg-white rounded-xl border px-5 py-12 text-center text-sm text-slate-400">
          No restaurants yet. Add some from My Restaurants.
        </div>
      )}
    </div>
  );
}
