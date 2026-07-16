"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { time: "8am", value: 45 },
  { time: "9am", value: 120 },
  { time: "10am", value: 165 },
  { time: "11am", value: 178 },
  { time: "12pm", value: 182 },
  { time: "1pm", value: 185 },
  { time: "2pm", value: 187 },
];

export function AttendanceChart() {
  return (
    <div className="mt-3 h-16">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, 220]} />
          <Tooltip
            contentStyle={{
              background: "#1a2235",
              border: "1px solid #334155",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#attendanceGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}