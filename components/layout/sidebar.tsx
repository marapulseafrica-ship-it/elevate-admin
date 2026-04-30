"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, DollarSign, FileText, BarChart3,
  LogOut, ShieldCheck, CreditCard, Bell, BellOff, BellRing,
} from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useEffect, useRef, useState, useCallback } from "react";

const NOTIF_PREF_KEY = "elevate_notif_enabled";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);

  const prevCount = useRef<number | null>(null);
  const enabledRef = useRef(false);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  // Load permission + stored preference on mount
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const perm = Notification.permission;
    setPermission(perm);
    if (perm === "granted") {
      const stored = localStorage.getItem(NOTIF_PREF_KEY);
      setEnabled(stored === null ? true : stored === "true");
    }
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/payments/pending-count", { cache: "no-store" });
      if (!res.ok) return;
      const { count } = await res.json() as { count: number };

      setPendingCount(count);

      if (
        prevCount.current !== null &&
        count > prevCount.current &&
        enabledRef.current &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        const diff = count - prevCount.current;
        new Notification("New Payment Request — Elevate Admin", {
          body: `${diff} new payment${diff > 1 ? "s" : ""} waiting for your approval.`,
          icon: "/favicon.ico",
        });
      }

      prevCount.current = count;
    } catch {}
  }, []);

  // Poll every 5 seconds — reliable on Vercel serverless
  useEffect(() => {
    fetchCount(); // immediate on mount
    const timer = setInterval(fetchCount, 5000);
    return () => clearInterval(timer);
  }, [fetchCount]);

  async function handleEnable() {
    if (typeof Notification === "undefined") return;
    let perm = permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
      setPermission(perm);
    }
    if (perm === "granted") {
      setEnabled(true);
      localStorage.setItem(NOTIF_PREF_KEY, "true");
      new Notification("Elevate Admin — Notifications enabled ✓", {
        body: "You'll be alerted instantly when new payments arrive.",
        icon: "/favicon.ico",
      });
    }
  }

  function handleDisable() {
    setEnabled(false);
    localStorage.setItem(NOTIF_PREF_KEY, "false");
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const nav = [
    { name: "Overview",    href: "/",            icon: LayoutDashboard, badge: 0 },
    { name: "Restaurants", href: "/restaurants", icon: Building2,       badge: 0 },
    { name: "Payments",    href: "/payments",    icon: CreditCard,      badge: pendingCount },
    { name: "Finance",     href: "/finance",     icon: DollarSign,      badge: 0 },
    { name: "Invoices",    href: "/invoices",    icon: FileText,        badge: 0 },
    { name: "Analytics",   href: "/analytics",   icon: BarChart3,       badge: 0 },
  ];

  function NotifButton() {
    if (permission === "denied") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 px-3 py-1.5 rounded-lg bg-slate-800">
          <BellOff className="w-3.5 h-3.5" />
          Blocked — allow in browser settings
        </div>
      );
    }
    if (permission === "granted" && enabled) {
      return (
        <button
          onClick={handleDisable}
          className="flex items-center gap-1.5 text-xs text-green-400 hover:text-red-400 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors w-full group"
        >
          <Bell className="w-3.5 h-3.5 group-hover:hidden" />
          <BellOff className="w-3.5 h-3.5 hidden group-hover:block" />
          <span className="group-hover:hidden">Notifications on</span>
          <span className="hidden group-hover:inline">Turn off</span>
        </button>
      );
    }
    return (
      <button
        onClick={handleEnable}
        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors w-full"
      >
        <BellRing className="w-3.5 h-3.5" />
        {permission === "granted" ? "Turn on notifications" : "Enable notifications"}
      </button>
    );
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
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 space-y-2">
        <NotifButton />
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
