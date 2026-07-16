import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

export interface FeatureItem {
  name: string;
  status?: "active" | "pending";
  icon?: LucideIcon;
}

export function FeatureGrid({ features, title }: { features: FeatureItem[]; title?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      {title && <h2 className="mb-4 text-sm font-semibold text-text">{title}</h2>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon ?? CheckCircle2;
          return (
            <div
              key={f.name}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated px-3 py-2.5"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-text-muted">{f.name}</span>
              {f.status === "active" && (
                <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}