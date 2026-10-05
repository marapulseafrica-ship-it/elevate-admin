import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";
import { AgentLeadManager } from "@/components/agent/agent-lead-manager";

export const dynamic = "force-dynamic";

export default async function AgentLeadsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("*").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const nextMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10);

  const [myLeadsRes, allClaimedRes] = await Promise.all([
    supabaseAdmin.from("agent_leads").select("*, agent_calls(id, call_type, outcome, notes, created_at)").eq("agent_id", agent.id).gte("month", thisMonth).lt("month", nextMonthDate).order("claimed_at"),
    supabaseAdmin.rpc("get_all_claimed_restaurants", { p_month: thisMonth }),
  ]);

  const myLeads = myLeadsRes.data ?? [];
  const allClaimed = (allClaimedRes.data ?? []) as any[];
  const totalCalls = myLeads.reduce((s, l) => s + (l.qualified_calls ?? 0), 0);

  const statusColor: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600",
    contacted: "bg-blue-100 text-blue-700",
    interested: "bg-yellow-100 text-yellow-700",
    free_trial: "bg-purple-100 text-purple-700",
    activated: "bg-emerald-100 text-emerald-700",
    lost: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Leads</h1>
        <p className="text-sm text-slate-500">{format(new Date(), "MMMM yyyy")} · {myLeads.length}/25 restaurants · {totalCalls}/25 qualified calls</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Restaurants ({myLeads.length}/25)</span>
            <span>{Math.round((myLeads.length / 25) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min((myLeads.length / 25) * 100, 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Qualified calls ({totalCalls}/25)</span>
            <span>{totalCalls >= 25 ? "✓ Full rate — K250" : `K${totalCalls * 10} so far`}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min((totalCalls / 25) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Lead manager (add lead + log call) */}
      <AgentLeadManager agentId={agent.id} leads={myLeads} />

      {/* Other agents' claimed restaurants */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-slate-700">Restaurants Claimed This Month (All Agents)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Do not contact restaurants already listed by another agent</p>
        </div>
        {allClaimed.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No restaurants listed yet this month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                  <th className="text-left font-medium px-5 py-3">Restaurant</th>
                  <th className="text-left font-medium px-5 py-3">Agent</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {allClaimed.map((r: any, i: number) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">{r.restaurant_name}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{r.agent_name === agent.full_name ? "You" : r.agent_name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[r.status] ?? ""}`}>
                        {r.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
