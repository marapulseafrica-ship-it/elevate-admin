import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AgentDashboardPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("*").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const nextMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10);

  const [leadsRes, callsRes, conversionsRes, payoutsRes] = await Promise.all([
    supabaseAdmin.from("agent_leads").select("id, qualified_calls, status").eq("agent_id", agent.id).gte("month", thisMonth).lt("month", nextMonthDate),
    supabaseAdmin.from("agent_calls").select("id").eq("agent_id", agent.id).gte("created_at", thisMonth),
    supabaseAdmin.from("agent_conversions").select("id, activated_at").eq("agent_id", agent.id),
    supabaseAdmin.from("agent_payouts").select("total, status").eq("agent_id", agent.id),
  ]);

  const leads = leadsRes.data ?? [];
  const totalCalls = leads.reduce((s, l) => s + (l.qualified_calls ?? 0), 0);
  const activations = (conversionsRes.data ?? []).filter(c => c.activated_at).length;
  const activityFee = totalCalls >= 25 ? 250 : totalCalls * 10;
  const unpaid = (payoutsRes.data ?? []).filter(p => p.status !== "paid").reduce((s, p) => s + Number(p.total ?? 0), 0);

  const recentLeads = await supabaseAdmin.from("agent_leads").select("*").eq("agent_id", agent.id).order("claimed_at", { ascending: false }).limit(5);

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
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {agent.full_name.split(" ")[0]}</h1>
        <p className="text-sm text-slate-500">{format(new Date(), "MMMM yyyy")} · Agent Portal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Restaurants Listed</div>
          <div className="text-3xl font-bold text-slate-800">{leads.length}<span className="text-base font-normal text-slate-400">/25</span></div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Qualified Calls</div>
          <div className="text-3xl font-bold text-slate-800">{totalCalls}<span className="text-base font-normal text-slate-400">/25</span></div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Activity Fee</div>
          <div className="text-3xl font-bold text-purple-600">K{activityFee}</div>
          <div className="text-xs text-slate-400">{totalCalls >= 25 ? "Full rate" : `K10 × ${totalCalls}`}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Total Activations</div>
          <div className="text-3xl font-bold text-emerald-600">{activations}</div>
          <div className="text-xs text-slate-400">K1,000 bonus each</div>
        </div>
      </div>

      {/* Unpaid balance */}
      {unpaid > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-amber-800">Pending Payout</div>
            <div className="text-xs text-amber-600">ElevateAI pays by the 10th of each month</div>
          </div>
          <div className="text-2xl font-bold text-amber-700">K{unpaid.toFixed(0)}</div>
        </div>
      )}

      {/* Contract terms */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Your Agreement Terms</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex gap-2"><span className="text-purple-500">▸</span>List up to 25 restaurants per month</div>
          <div className="flex gap-2"><span className="text-purple-500">▸</span>K250 activity fee for 25+ qualified calls</div>
          <div className="flex gap-2"><span className="text-purple-500">▸</span>K10 per call if under 25 calls</div>
          <div className="flex gap-2"><span className="text-purple-500">▸</span>K1,000 bonus when a restaurant activates</div>
          <div className="flex gap-2"><span className="text-purple-500">▸</span>10% commission on performance fee (5 paid months)</div>
          <div className="flex gap-2"><span className="text-purple-500">▸</span>Payment by 10th of each month</div>
        </div>
      </div>

      {/* Recent leads */}
      {(recentLeads.data ?? []).length > 0 && (
        <div className="bg-white rounded-xl border p-0 overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-slate-700">Recent Restaurants</h2>
          </div>
          <div className="divide-y">
            {(recentLeads.data ?? []).map((lead: any) => (
              <div key={lead.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">{lead.restaurant_name}</div>
                  <div className="text-xs text-slate-400">{lead.qualified_calls} qualified calls</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[lead.status] ?? ""}`}>
                  {lead.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
