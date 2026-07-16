"use client";

import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const burnoutData = [
  { name: "Risk", value: 75 },
  { name: "Safe", value: 25 },
];

const performerData = [
  { month: "Jan", score: 180 },
  { month: "Feb", score: 195 },
  { month: "Mar", score: 210 },
  { month: "Apr", score: 185 },
  { month: "May", score: 250 },
  { month: "Jun", score: 220 },
];

const turnoverData = [
  { month: "Jan", rate: 120 },
  { month: "Feb", rate: 135 },
  { month: "Mar", rate: 150 },
  { month: "Apr", rate: 165 },
  { month: "May", rate: 190 },
  { month: "Jun", rate: 210 },
  { month: "Jul", rate: 225 },
];

export function AIAnalyticsSection() {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-text">AI Analytics</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs text-text-muted">Burnout Detection</p>
          <div className="relative mx-auto mt-2 h-36 w-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={burnoutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text">75%</span>
              <span className="text-[10px] text-text-dim">Risk Level</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs text-text-muted">High Performer</p>
          <div className="mt-2 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performerData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1a2235",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {performerData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.month === "May" ? "#f1f5f9" : "#334155"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">Turnover Trend</p>
            <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-medium text-danger">
              +5% this month
            </span>
          </div>
          <div className="mt-2 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={turnoverData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1a2235",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}