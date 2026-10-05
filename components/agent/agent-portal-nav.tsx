"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Store, GitBranch, DollarSign,
  BarChart2, BookOpen, User, Bell, LogOut, Briefcase, Menu, X,
} from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useState } from "react";

const navItems = [
  { label: "Dashboard",      href: "/agent",              icon: LayoutDashboard },
  { label: "My Restaurants", href: "/agent/restaurants",  icon: Store },
  { label: "Pipeline",       href: "/agent/pipeline",     icon: GitBranch },
  { label: "Earnings",       href: "/agent/earnings",     icon: DollarSign },
  { label: "Performance",    href: "/agent/performance",  icon: BarChart2 },
  { label: "Resources",      href: "/agent/resources",    icon: BookOpen },
  { label: "Profile",        href: "/agent/profile",      icon: User },
  { label: "Notifications",  href: "/agent/notifications",icon: Bell },
];

export function AgentPortalNav({ agentName }: { agentName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) => href === "/agent" ? pathname === "/agent" : pathname.startsWith(href);

  return (
    <>
      {/* Top bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/agent" className="flex items-center gap-2">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">
              ELEVATE <span className="text-purple-400">AGENT</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive(item.href) ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden lg:block text-sm text-slate-400">{agentName}</span>
            <button onClick={handleSignOut} className="hidden lg:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-slate-300 hover:text-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-slate-800 border-b border-slate-700 sticky top-16 z-20 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href) ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-white w-full">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </>
  );
}
