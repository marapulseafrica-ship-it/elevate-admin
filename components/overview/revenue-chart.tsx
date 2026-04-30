"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Props {
  data: { month: string; subscriptions: number; setup_fees: number; total: number }[];
}

export function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <Tooltip formatter={(v, name) => [`$${Number(v).toFixed(2)}`, name === "subscriptions" ? "Subscriptions" : "Setup Fees"]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="subscriptions" name="Subscriptions" stackId="a" fill="#9333ea" radius={[0, 0, 0, 0]} />
        <Bar dataKey="setup_fees" name="Setup Fees" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
