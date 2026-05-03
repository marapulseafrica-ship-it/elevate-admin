"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type Lead = { status: string; type: string };

const STAGES = [
  { key: "leads",     label: "Total Leads",    color: "#3b82f6", bg: "bg-blue-50",   text: "text-blue-600"   },
  { key: "contacted", label: "Contacted",       color: "#f59e0b", bg: "bg-amber-50",  text: "text-amber-600"  },
  { key: "booked",    label: "Booked",          color: "#8b5cf6", bg: "bg-purple-50", text: "text-purple-600" },
  { key: "won",       label: "Won / Paying",    color: "#10b981", bg: "bg-green-50",  text: "text-green-600"  },
];

function calcFunnel(leads: Lead[]) {
  const total     = leads.length;
  const contacted = leads.filter(l => ["contacted","booked","closed"].includes(l.status)).length;
  const booked    = leads.filter(l => ["booked","closed"].includes(l.status)).length;
  const won       = leads.filter(l => l.status === "closed").length;
  return { leads: total, contacted, booked, won };
}

function rate(num: number, den: number) {
  if (den === 0) return "—";
  return `${Math.round((num / den) * 100)}%`;
}

export function FunnelStats({ leads }: { leads: Lead[] }) {
  const f = calcFunnel(leads);

  const chartData = [
    { name: "Leads",     value: f.leads,     color: "#3b82f6" },
    { name: "Contacted", value: f.contacted, color: "#f59e0b" },
    { name: "Booked",    value: f.booked,    color: "#8b5cf6" },
    { name: "Won",       value: f.won,       color: "#10b981" },
  ];

  const conversions = [
    { label: "Lead → Contacted",  value: rate(f.contacted, f.leads)     },
    { label: "Contacted → Booked",value: rate(f.booked,    f.contacted) },
    { label: "Booked → Won",      value: rate(f.won,       f.booked)    },
    { label: "Overall Close Rate",value: rate(f.won,       f.leads)     },
  ];

  const cards = [
    { ...STAGES[0], count: f.leads     },
    { ...STAGES[1], count: f.contacted },
    { ...STAGES[2], count: f.booked    },
    { ...STAGES[3], count: f.won       },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((s) => (
          <div key={s.key} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.text}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Chart + conversion rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4">Sales Funnel</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" barSize={28} margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 13, fill: "#475569" }} axisLine={false} tickLine={false} />
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

        {/* Conversion rates */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4">Conversion Rates</p>
          <div className="space-y-4">
            {conversions.map((c) => (
              <div key={c.label} className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-sm font-bold text-slate-800">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Status key</p>
            <div className="mt-2 space-y-1.5">
              {STAGES.map(s => (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-slate-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
