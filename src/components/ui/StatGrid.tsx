import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: string | number;
  trend?: string;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
}

const colorMap = {
  blue: "text-primary",
  green: "text-success",
  red: "text-danger",
  yellow: "text-warning",
  purple: "text-accent",
};

export function StatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted">{stat.label}</p>
          <p className={cn("mt-1 text-2xl font-bold", colorMap[stat.color ?? "blue"])}>
            {stat.value}
          </p>
          {stat.trend && <p className="mt-1 text-[10px] text-text-dim">{stat.trend}</p>}
        </div>
      ))}
    </div>
  );
}