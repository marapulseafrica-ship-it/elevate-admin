import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AgentEarningsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("*").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const [payoutsRes, conversionsRes, commissionRes] = await Promise.all([
    supabaseAdmin.from("agent_payouts").select("*").eq("agent_id", agent.id).order("month", { ascending: false }),
    supabaseAdmin.from("agent_conversions").select("*, agent_commission_records(*)").eq("agent_id", agent.id).order("created_at", { ascending: false }),
    supabaseAdmin.from("agent_commission_records").select("commission_amount").eq("agent_id", agent.id),
  ]);

  const payouts = payoutsRes.data ?? [];
  const conversions = conversionsRes.data ?? [];
  const commissions = commissionRes.data ?? [];

  const totalEarned = payouts.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.total ?? 0), 0);
  const unpaid = payouts.filter(p => p.status !== "paid").reduce((s, p) => s + Number(p.total ?? 0), 0);
  const totalCommission = commissions.reduce((s, c) => s + Number(c.commission_amount ?? 0), 0);
  const activations = conversions.filter(c => c.activated_at).length;

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    approved: "bg-blue-50 text-blue-700 border border-blue-200",
    paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Earnings</h1>
        <p className="text-sm text-slate-500">All time summary</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-emerald-600">K{totalEarned.toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Pending Payout</div>
          <div className="text-2xl font-bold text-amber-600">K{unpaid.toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Commission Earned</div>
          <div className="text-2xl font-bold text-purple-600">K{totalCommission.toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Activations</div>
          <div className="text-2xl font-bold text-slate-800">{activations}</div>
          <div className="text-xs text-slate-400">K1,000 bonus each</div>
        </div>
      </div>

      {/* Conversions */}
      {conversions.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-slate-700">Restaurant Conversions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Commission tracked for 5 paid months per restaurant</p>
          </div>
          <div className="divide-y">
            {conversions.map((c: any) => {
              const paidMonths = (c.agent_commission_records ?? []).length;
              return (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{c.restaurant_id ?? "Restaurant"}</div>
                    <div className="text-xs text-slate-400">Trial: {format(new Date(c.free_trial_started_at), "MMM d, yyyy")}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1,2,3,4,5].map(m => (
                      <div key={m} className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold ${m <= paidMonths ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300"}`}>{m}</div>
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-emerald-600 w-16 text-right">
                    K{(c.agent_commission_records ?? []).reduce((s: number, r: any) => s + Number(r.commission_amount ?? 0), 0).toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payout history */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-slate-700">Payout History</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No payouts yet. They appear here at end of month.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                <th className="text-left font-medium px-5 py-3">Month</th>
                <th className="text-right font-medium px-5 py-3">Activity</th>
                <th className="text-right font-medium px-5 py-3">Bonuses</th>
                <th className="text-right font-medium px-5 py-3">Commission</th>
                <th className="text-right font-medium px-5 py-3">Total</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p: any) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-5 py-3 text-sm font-medium">{format(new Date(p.month), "MMMM yyyy")}</td>
                  <td className="px-5 py-3 text-sm text-right">K{Number(p.activity_fee ?? 0).toFixed(0)}</td>
                  <td className="px-5 py-3 text-sm text-right text-amber-600">K{Number(p.conversion_bonus ?? 0).toFixed(0)}</td>
                  <td className="px-5 py-3 text-sm text-right text-purple-600">K{Number(p.commission_total ?? 0).toFixed(0)}</td>
                  <td className="px-5 py-3 text-sm font-bold text-right">K{Number(p.total ?? 0).toFixed(0)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[p.status] ?? "bg-slate-100 text-slate-500"}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
