import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { AgentPortalNav } from "@/components/agent/agent-portal-nav";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin
    .from("sales_agents")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!agent) redirect("/login");

  if (!agent.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl border shadow-sm p-8 text-center">
          <h1 className="text-xl font-semibold mb-2 text-red-600">Account Deactivated</h1>
          <p className="text-sm text-slate-600">Your sales agent account has been deactivated. Please contact ElevateAI for assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AgentPortalNav agentName={agent.full_name} />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
