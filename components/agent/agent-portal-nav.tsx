"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, List, DollarSign, LogOut, Briefcase } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const navItems = [
  { label: "Dashboard", href: "/agent", icon: LayoutDashboard },
  { label: "My Leads", href: "/agent/leads", icon: List },
  { label: "Earnings", href: "/agent/earnings", icon: DollarSign },
];

export function AgentPortalNav({ agentName }: { agentName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/agent" className="flex items-center gap-2">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white">
              ELEVATE <span className="text-purple-400">AGENT</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">{agentName}</span>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden gap-1 pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
