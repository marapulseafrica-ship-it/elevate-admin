import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: agentRow } = await supabaseAdmin
      .from("sales_agents")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (agentRow) redirect("/agent");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
