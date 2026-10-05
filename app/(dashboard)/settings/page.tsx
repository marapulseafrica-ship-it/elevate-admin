export const dynamic = "force-dynamic";

import { createSupabaseServer } from "@/lib/supabase-server";
import { ProfileForm } from "@/components/settings/profile-form";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = (user.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your admin profile and account security</p>
      </div>

      <ProfileForm
        initialName={name}
        email={user.email ?? ""}
        createdAt={user.created_at}
        userId={user.id}
      />
    </div>
  );
}
