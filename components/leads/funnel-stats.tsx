"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type Lead = { status: string };

function calcFunnel(leads: Lead[]) {
  const total    = leads.length;
  const contacted = leads.filter(l => ["contacted","booked","won","lost"].includes(l.status)).length;
  const scheduled = leads.filter(l => ["booked","won","lost"].includes(l.status)).length;
  const won       = leads.filter(l => l.status === "won").length;
  const lost      = leads.filter(l => l.status === "lost").length;
  return { total, contacted, scheduled, won, lost };
}

function rate(num: number, den: number) {
  if (den === 0) return "—";
  return `${Math.round((num / den) * 100)}%`;
}

export function FunnelStats({ leads }: { leads: Lead[] }) {
  const f = calcFunnel(leads);

  const chartData = [
    { name: "Total Leads",          value: f.total,     color: "#3b82f6" },
    { name: "Contacted",            value: f.contacted, color: "#f59e0b" },
    { name: "Appt. Scheduled",      value: f.scheduled, color: "#8b5cf6" },
    { name: "Closed Won",           value: f.won,       color: "#10b981" },
  ];

  const cards = [
    { label: "Total Leads",         value: f.total,     color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Contacted",           value: f.contacted, color: "text-amber-600",  bg: "bg-amber-50"  },
    { label: "Appt. Scheduled",     value: f.scheduled, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Closed Won",          value: f.won,       color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Closed Lost",         value: f.lost,      color: "text-red-600",    bg: "bg-red-50"    },
  ];

  const conversions = [
    { label: "Lead → Contacted",         value: rate(f.contacted, f.total)     },
    { label: "Contacted → Appt.",        value: rate(f.scheduled, f.contacted) },
    { label: "Appt. → Closed Won",       value: rate(f.won,       f.scheduled) },
    { label: "Overall Win Rate",         value: rate(f.won,       f.total)     },
    { label: "Overall Loss Rate",        value: rate(f.lost,      f.total)     },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 leading-tight">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + conversion rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4">Sales Funnel</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" barSize={28} margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
                formatter={(value) => [value, "Leads"]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4">Conversion Rates</p>
          <div className="space-y-4">
            {conversions.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-sm font-bold text-slate-800 shrink-0">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
            {[
              { label: "Closed Won",     color: "#10b981" },
              { label: "Closed Lost",    color: "#ef4444" },
              { label: "Appt. Scheduled",color: "#8b5cf6" },
              { label: "Contacted",      color: "#f59e0b" },
              { label: "Total Leads",    color: "#3b82f6" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
