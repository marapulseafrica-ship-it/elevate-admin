import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";
import { RestaurantManager } from "@/components/agent/restaurant-manager";

export const dynamic = "force-dynamic";

export default async function AgentRestaurantsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("*").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const nextMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10);

  const [leadsRes, allClaimedRes] = await Promise.all([
    supabaseAdmin
      .from("agent_leads")
      .select("*, agent_calls(id, call_type, outcome, person_spoken_to, notes, call_date, next_followup_date)")
      .eq("agent_id", agent.id)
      .gte("month", thisMonth)
      .lt("month", nextMonthDate)
      .order("claimed_at"),
    supabaseAdmin.rpc("get_all_claimed_restaurants", { p_month: thisMonth }),
  ]);

  const leads = leadsRes.data ?? [];
  const allClaimed = (allClaimedRes.data ?? []) as any[];
  const totalCalls = leads.reduce((s: number, l: any) => s + (l.qualified_calls ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Restaurants</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {format(new Date(), "MMMM yyyy")} · {leads.length}/25 restaurants · {totalCalls}/25 qualified calls
        </p>
      </div>

      {/* Progress bars */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Restaurants listed</span>
            <span>{leads.length} / 25</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min((leads.length / 25) * 100, 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Qualified calls</span>
            <span>{totalCalls >= 25 ? "✓ K250 earned" : `K${totalCalls * 10} · need ${25 - totalCalls} more for K250`}</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min((totalCalls / 25) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <RestaurantManager
        agentId={agent.id}
        leads={leads}
        allClaimed={allClaimed.filter((r: any) => r.agent_id !== agent.id)}
        thisMonth={thisMonth}
      />
    </div>
  );
}
