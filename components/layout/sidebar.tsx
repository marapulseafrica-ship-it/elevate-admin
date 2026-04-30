"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, DollarSign, FileText, BarChart3, LogOut, ShieldCheck, CreditCard } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { PaymentNotifier } from "@/components/notifications/payment-notifier";

const nav = [
  { name: "Overview",    href: "/",             icon: LayoutDashboard },
  { name: "Restaurants", href: "/restaurants",  icon: Building2 },
  { name: "Payments",    href: "/payments",     icon: CreditCard },
  { name: "Finance",     href: "/finance",      icon: DollarSign },
  { name: "Invoices",    href: "/invoices",     icon: FileText },
  { name: "Analytics",   href: "/analytics",    icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden md:flex w-60 bg-slate-900 flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 p-2 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">ELEVATE</div>
            <div className="text-purple-400 text-xs font-semibold">ADMIN</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 space-y-2">
        <PaymentNotifier />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
