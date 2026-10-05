import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format, addMonths, setDate } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AgentEarningsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("*").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const [summaryRes, payoutsRes, conversionsRes] = await Promise.all([
    supabaseAdmin.rpc("get_agent_earnings_summary", { p_agent_id: agent.id }),
    supabaseAdmin.from("agent_payouts").select("*").eq("agent_id", agent.id).order("month", { ascending: false }),
    supabaseAdmin.from("agent_conversions").select("*, agent_commission_records(*)").eq("agent_id", agent.id).order("created_at", { ascending: false }),
  ]);

  const summary = summaryRes.data as any ?? {};
  const payouts = payoutsRes.data ?? [];
  const conversions = conversionsRes.data ?? [];

  const nextPayment = setDate(addMonths(new Date(), 1), 10);

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    approved: "bg-blue-50 text-blue-700 border border-blue-200",
    paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Earnings</h1>
          <p className="text-sm text-slate-500">All-time summary</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-center">
          <div className="text-xs text-purple-500 font-medium">Next Payment</div>
          <div className="text-base font-bold text-purple-700">{format(nextPayment, "do MMM yyyy")}</div>
          <div className="text-xs text-purple-400">Statement by 5th</div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Total Paid Out</div>
          <div className="text-2xl font-bold text-emerald-600">K{Number(summary.paid_out ?? 0).toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Pending Payout</div>
          <div className="text-2xl font-bold text-amber-600">K{Number(summary.pending_payout ?? 0).toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-xl border p-4 sm:col-span-1 col-span-2">
          <div className="text-xs text-slate-500 mb-1">Grand Total Earned</div>
          <div className="text-2xl font-bold text-slate-800">K{Number(summary.grand_total ?? 0).toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Activity Fees</div>
          <div className="text-xl font-bold text-purple-600">K{Number(summary.total_activity_fees ?? 0).toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Conversion Bonuses</div>
          <div className="text-xl font-bold text-amber-600">K{Number(summary.total_bonuses ?? 0).toFixed(0)}</div>
          <div className="text-xs text-slate-400 mt-0.5">K1,000 per activation</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-slate-500 mb-1">Total Commission</div>
          <div className="text-xl font-bold text-blue-600">K{Number(summary.total_commission ?? 0).toFixed(0)}</div>
          <div className="text-xs text-slate-400 mt-0.5">10% of performance fees</div>
        </div>
      </div>

      {/* Commission tracker */}
      {conversions.filter((c: any) => c.activated_at).length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-slate-700">Commission Tracker</h2>
            <p className="text-xs text-slate-400 mt-0.5">You earn 10% of the Performance Fee for the first 5 paid months per restaurant</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                  <th className="text-left font-medium px-5 py-3">Restaurant</th>
                  <th className="text-left font-medium px-5 py-3">Trial</th>
                  <th className="text-left font-medium px-5 py-3">Activated</th>
                  <th className="text-left font-medium px-5 py-3">Paid Months</th>
                  <th className="text-right font-medium px-5 py-3">Commission</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((c: any) => {
                  const paidMonths = c.agent_commission_records?.length ?? 0;
                  const earned = (c.agent_commission_records ?? []).reduce((s: number, r: any) => s + Number(r.commission_amount ?? 0), 0);
                  return (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3 text-sm font-medium text-slate-800">{c.restaurant_id ?? "Restaurant"}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{format(new Date(c.free_trial_started_at), "dd MMM yyyy")}</td>
                      <td className="px-5 py-3">
                        {c.activated_at
                          ? <span className="text-xs text-emerald-600 font-medium">✓ {format(new Date(c.activated_at), "dd MMM yyyy")}</span>
                          : <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Trial</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(m => (
                            <div key={m} className={`w-6 h-6 rounded text-[10px] flex items-center justify-center font-bold ${m <= paidMonths ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300"}`}>{m}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-emerald-600 text-right">K{earned.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conversion bonus tracker */}
      {conversions.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold text-slate-700">Conversion Bonuses</h2>
            <p className="text-xs text-slate-400 mt-0.5">K1,000 bonus earned when ElevateAI receives the full Activation Fee</p>
          </div>
          <div className="divide-y">
            {conversions.map((c: any) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">{c.restaurant_id ?? "Restaurant"}</div>
                  <div className="text-xs text-slate-400">{format(new Date(c.free_trial_started_at), "d MMM yyyy")}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">K1,000</div>
                  {c.activated_at && c.activation_bonus_paid
                    ? <span className="text-xs text-emerald-600 font-medium">Paid ✓</span>
                    : c.activated_at
                    ? <span className="text-xs text-amber-600 font-medium">Activated · Pending payment</span>
                    : <span className="text-xs text-slate-400">Pending activation</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout history */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-slate-700">Payout History</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">No payouts yet — your first statement arrives by the 5th of next month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                  <th className="text-left font-medium px-5 py-3">Month</th>
                  <th className="text-right font-medium px-5 py-3">Activity</th>
                  <th className="text-right font-medium px-5 py-3">Bonuses</th>
                  <th className="text-right font-medium px-5 py-3">Commission</th>
                  <th className="text-right font-medium px-5 py-3 font-bold">Total</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-medium">{format(new Date(p.month), "MMMM yyyy")}</td>
                    <td className="px-5 py-3 text-sm text-right text-slate-600">K{Number(p.activity_fee ?? 0).toFixed(0)}</td>
                    <td className="px-5 py-3 text-sm text-right text-amber-600">K{Number(p.conversion_bonuses ?? 0).toFixed(0)}</td>
                    <td className="px-5 py-3 text-sm text-right text-blue-600">K{Number(p.commission ?? 0).toFixed(0)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-right">K{Number(p.total ?? 0).toFixed(0)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[p.status] ?? "bg-slate-100 text-slate-500"}`}>{p.status}</span>
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
