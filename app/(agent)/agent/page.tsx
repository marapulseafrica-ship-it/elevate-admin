import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format, addDays } from "date-fns";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? "text-slate-800"}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default async function AgentDashboardPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("*").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [summaryRes, conversionsRes, announcementsRes, followupsRes] = await Promise.all([
    supabaseAdmin.rpc("get_agent_month_summary", { p_agent_id: agent.id }),
    supabaseAdmin.from("agent_conversions").select("*, agent_commission_records(commission_amount)").eq("agent_id", agent.id).order("created_at", { ascending: false }),
    supabaseAdmin.from("agent_announcements").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(3),
    supabaseAdmin.from("agent_leads").select("id, restaurant_name, next_followup_date, status")
      .eq("agent_id", agent.id)
      .not("next_followup_date", "is", null)
      .lte("next_followup_date", format(addDays(new Date(), 3), "yyyy-MM-dd"))
      .order("next_followup_date"),
  ]);

  const summary = summaryRes.data as any ?? {};
  const conversions = conversionsRes.data ?? [];
  const announcements = announcementsRes.data ?? [];
  const followups = followupsRes.data ?? [];

  const qualifiedCalls = summary.qualified_calls ?? 0;
  const activityFee = summary.activity_fee ?? 0;
  const bonuses = summary.bonuses_this_month ?? 0;
  const commission = summary.commission_this_month ?? 0;
  const totalEarnings = summary.total_earnings_this_month ?? 0;
  const leadsCount = summary.leads_submitted ?? 0;
  const trialCount = conversions.filter((c: any) => !c.activated_at).length;
  const activatedCount = conversions.filter((c: any) => c.activated_at).length;

  const pct = Math.min(Math.round((qualifiedCalls / 25) * 100), 100);
  const nextPayment = new Date();
  nextPayment.setMonth(nextPayment.getMonth() + 1);
  nextPayment.setDate(10);

  const statusColor: Record<string, string> = {
    pending: "bg-slate-100 text-slate-500",
    contacted: "bg-blue-100 text-blue-700",
    interested: "bg-yellow-100 text-yellow-700",
    follow_up: "bg-orange-100 text-orange-700",
    free_trial: "bg-purple-100 text-purple-700",
    activated: "bg-emerald-100 text-emerald-700",
    lost: "bg-red-100 text-red-600",
    already_client: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {agent.full_name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">{format(new Date(), "MMMM yyyy")} performance</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-center">
          <div className="text-xs text-purple-500 font-medium">Next Payment</div>
          <div className="text-base font-bold text-purple-700">{format(nextPayment, "do MMM yyyy")}</div>
        </div>
      </div>

      {/* Call progress */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Monthly Qualified Calls</span>
          <span className="text-lg font-bold text-slate-800">{qualifiedCalls} <span className="text-slate-400 font-normal text-sm">/ 25</span></span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct >= 100 ? "#10b981" : pct >= 60 ? "#a855f7" : "#6366f1",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>{pct}% of target</span>
          <span>{qualifiedCalls >= 25 ? "✓ Full rate — K250" : `K${qualifiedCalls * 10} so far · ${25 - qualifiedCalls} more to earn K250`}</span>
        </div>
      </div>

      {/* Earnings cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Activity Fee" value={`K${Number(activityFee).toFixed(0)}`} sub={qualifiedCalls >= 25 ? "Full rate" : `K10 × ${qualifiedCalls}`} accent="text-purple-600" />
        <StatCard label="Conversion Bonuses" value={`K${Number(bonuses).toFixed(0)}`} sub={`${activatedCount} activation${activatedCount !== 1 ? "s" : ""}`} accent="text-amber-600" />
        <StatCard label="Commission" value={`K${Number(commission).toFixed(0)}`} sub="10% of perf fees" accent="text-blue-600" />
        <StatCard label="Total This Month" value={`K${Number(totalEarnings).toFixed(0)}`} accent="text-emerald-600" />
      </div>

      {/* Restaurant counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Listed" value={`${leadsCount}/25`} sub="restaurants this month" />
        <StatCard label="In Trial" value={String(trialCount)} sub="free trial active" accent="text-purple-600" />
        <StatCard label="Activated" value={String(activatedCount)} sub="paying restaurants" accent="text-emerald-600" />
        <StatCard label="Earning Commission" value={String(conversions.filter((c: any) => (c.agent_commission_records?.length ?? 0) < 5 && c.activated_at).length)} sub="restaurants (up to 5 months)" accent="text-blue-600" />
      </div>

      {/* Follow-ups due */}
      {followups.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 flex items-center gap-2">
            <span className="text-sm font-semibold text-amber-800">🔔 Follow-ups Due Soon</span>
          </div>
          <div className="divide-y divide-amber-100">
            {followups.map((f: any) => (
              <div key={f.id} className="px-5 py-3 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-800">{f.restaurant_name}</div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[f.status] ?? ""}`}>{f.status?.replace(/_/g, " ")}</span>
                  <span className="text-xs text-amber-700 font-medium">{format(new Date(f.next_followup_date), "dd MMM")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active commission restaurants */}
      {conversions.filter((c: any) => c.activated_at).length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-slate-700">Commission Restaurants</h2>
            <p className="text-xs text-slate-400 mt-0.5">Restaurants still generating 10% commission for you</p>
          </div>
          <div className="divide-y">
            {conversions.filter((c: any) => c.activated_at).map((c: any) => {
              const paidMonths = c.agent_commission_records?.length ?? 0;
              const commEarned = (c.agent_commission_records ?? []).reduce((s: number, r: any) => s + Number(r.commission_amount ?? 0), 0);
              return (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800 truncate">{c.restaurant_id ?? "Restaurant"}</div>
                    <div className="text-xs text-slate-400">Activated {format(new Date(c.activated_at), "MMM d, yyyy")}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1,2,3,4,5].map(m => (
                      <div key={m} className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold ${m <= paidMonths ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300"}`}>{m}</div>
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-emerald-600 shrink-0">K{commEarned.toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-slate-700">📢 Announcements</h2>
          </div>
          <div className="divide-y">
            {announcements.map((a: any) => (
              <div key={a.id} className="px-5 py-4">
                <div className="text-sm font-semibold text-slate-800">{a.title}</div>
                <div className="text-sm text-slate-600 mt-1">{a.body}</div>
                <div className="text-xs text-slate-400 mt-2">{format(new Date(a.created_at), "d MMM yyyy")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract terms */}
      <div className="bg-slate-50 rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Your Agreement Terms</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex gap-2"><span className="text-purple-500 shrink-0">▸</span>List up to 25 restaurants per month</div>
          <div className="flex gap-2"><span className="text-purple-500 shrink-0">▸</span>K250 activity fee for 25+ qualified calls</div>
          <div className="flex gap-2"><span className="text-purple-500 shrink-0">▸</span>K10 per call if under 25 calls</div>
          <div className="flex gap-2"><span className="text-purple-500 shrink-0">▸</span>K1,000 bonus when a restaurant activates</div>
          <div className="flex gap-2"><span className="text-purple-500 shrink-0">▸</span>10% commission on perf fee (5 paid months)</div>
          <div className="flex gap-2"><span className="text-purple-500 shrink-0">▸</span>Statement by 5th · Payment by 10th</div>
        </div>
      </div>
    </div>
  );
}
