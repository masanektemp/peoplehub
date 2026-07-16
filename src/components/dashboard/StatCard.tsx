import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  dotColor?: "green" | "red" | "yellow" | "blue";
  className?: string;
  children?: React.ReactNode;
}

const dotColors = {
  green: "bg-success",
  red: "bg-danger",
  yellow: "bg-warning",
  blue: "bg-primary",
};

export function StatCard({ label, value, dotColor, className, children }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {dotColor && (
          <span className={cn("h-2 w-2 rounded-full", dotColors[dotColor])} />
        )}
        <p className="text-xs text-text-muted">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-bold text-text">{value}</p>
      {children}
    </div>
  );
}