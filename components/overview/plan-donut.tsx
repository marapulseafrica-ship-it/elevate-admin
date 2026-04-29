"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = { starter: "#3b82f6", basic: "#10b981", pro: "#f97316", premium: "#9333ea" };

interface Props { byTier: Record<string, number> }

export function PlanDonut({ byTier }: Props) {
  const data = Object.entries(byTier)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) return <p className="text-sm text-slate-400 text-center py-10">No data yet</p>;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip formatter={(v, name) => [v, name]} />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs capitalize text-slate-600">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
