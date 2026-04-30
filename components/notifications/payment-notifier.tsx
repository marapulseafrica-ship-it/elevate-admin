"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";

export function PaymentNotifier() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const lastCount = useRef<number | null>(null);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  async function requestPermission() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  useEffect(() => {
    if (permission !== "granted") return;

    async function poll() {
      try {
        const res = await fetch("/api/payments/pending-count");
        const { count } = await res.json();

        if (lastCount.current !== null && count > lastCount.current) {
          const diff = count - lastCount.current;
          new Notification("New Payment Request — Elevate Admin", {
            body: `${diff} new payment${diff > 1 ? "s" : ""} waiting for approval.`,
            icon: "/favicon.ico",
            tag: "payment-notification",
          });
        }
        lastCount.current = count;
      } catch {}
    }

    poll(); // run immediately
    const interval = setInterval(poll, 30000); // then every 30s
    return () => clearInterval(interval);
  }, [permission]);

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-400 px-3 py-1.5 rounded-lg bg-slate-800">
        <Bell className="w-3.5 h-3.5" />
        Notifications on
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
    >
      <BellOff className="w-3.5 h-3.5" />
      Enable notifications
    </button>
  );
}
