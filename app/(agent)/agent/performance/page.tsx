import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AgentPerformancePage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("id, full_name, created_at").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const [summaryRes, leadsRes, payoutsRes, leaderboardRes] = await Promise.all([
    supabaseAdmin.rpc("get_agent_earnings_summary", { p_agent_id: agent.id }),
    supabaseAdmin.from("agent_leads").select("id, status, qualified_calls, month").eq("agent_id", agent.id),
    supabaseAdmin.from("agent_payouts").select("month, qualified_calls, activity_fee, total").eq("agent_id", agent.id).order("month", { ascending: false }).limit(6),
    supabaseAdmin.rpc("get_agents_admin_overview"),
  ]);

  const summary = summaryRes.data as any ?? {};
  const allLeads = leadsRes.data ?? [];
  const payouts = payoutsRes.data ?? [];
  const leaderboard = (leaderboardRes.data ?? []).sort((a: any, b: any) => Number(b.total_conversions) - Number(a.total_conversions));

  const totalLeads = allLeads.length;
  const activated = allLeads.filter((l: any) => l.status === "activated").length;
  const conversionRate = totalLeads > 0 ? Math.round((activated / totalLeads) * 100) : 0;
  const thisMonthCalls = leaderboard.find((a: any) => a.agent_id === agent.id)?.month_calls ?? 0;

  const myRank = leaderboard.findIndex((a: any) => a.agent_id === agent.id) + 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Performance</h1>
        <p className="text-sm text-slate-500">All-time stats · Joined {format(new Date(agent.created_at), "MMMM yyyy")}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Total Calls</div>
          <div className="text-2xl font-bold text-slate-800">{summary.total_calls ?? 0}</div>
          <div className="text-xs text-slate-400 mt-0.5">all time qualified calls</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Conversion Rate</div>
          <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
          <div className="text-xs text-slate-400 mt-0.5">{activated} of {totalLeads} restaurants</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Restaurants Acquired</div>
          <div className="text-2xl font-bold text-emerald-600">{summary.active_restaurants ?? 0}</div>
          <div className="text-xs text-slate-400 mt-0.5">paying ElevateAI</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Total Earned</div>
          <div className="text-2xl font-bold text-amber-600">K{Number(summary.grand_total ?? 0).toFixed(0)}</div>
          <div className="text-xs text-slate-400 mt-0.5">lifetime</div>
        </div>
      </div>

      {/* Monthly history */}
      {payouts.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-slate-700">Monthly Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[450px]">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                  <th className="text-left font-medium px-5 py-3">Month</th>
                  <th className="text-right font-medium px-5 py-3">Qualified Calls</th>
                  <th className="text-right font-medium px-5 py-3">Activity Fee</th>
                  <th className="text-right font-medium px-5 py-3">Total Payout</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p: any) => (
                  <tr key={p.month} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-medium">{format(new Date(p.month), "MMMM yyyy")}</td>
                    <td className="px-5 py-3 text-sm text-right">
                      <span className={`font-semibold ${p.qualified_calls >= 25 ? "text-emerald-600" : "text-slate-700"}`}>{p.qualified_calls ?? 0}/25</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-purple-600">K{Number(p.activity_fee ?? 0).toFixed(0)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-right">K{Number(p.total ?? 0).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 1 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Agent Leaderboard</h2>
              <p className="text-xs text-slate-400 mt-0.5">This month · by restaurants acquired</p>
            </div>
            {myRank > 0 && (
              <div className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-semibold">
                Your rank: #{myRank}
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                  <th className="text-left font-medium px-5 py-3">Rank</th>
                  <th className="text-left font-medium px-5 py-3">Agent</th>
                  <th className="text-right font-medium px-5 py-3">Calls</th>
                  <th className="text-right font-medium px-5 py-3">Acquired</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 10).map((a: any, i: number) => {
                  const isMe = a.agent_id === agent.id;
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                  return (
                    <tr key={a.agent_id} className={`border-b last:border-0 ${isMe ? "bg-purple-50" : "hover:bg-slate-50"}`}>
                      <td className="px-5 py-3 text-sm">{medal}</td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-800">
                        {a.full_name} {isMe && <span className="text-xs text-purple-600 ml-1">(you)</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-right">{a.month_calls ?? 0}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-right text-emerald-600">{a.total_conversions ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
