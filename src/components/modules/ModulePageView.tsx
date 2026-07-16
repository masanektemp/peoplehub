"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatGrid } from "@/components/ui/StatGrid";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { DataTable } from "@/components/ui/DataTable";
import { AIAnalyticsSection } from "@/components/ai/AIAnalyticsSection";
import type { ModulePageData } from "@/lib/modules";

interface ModulePageViewProps {
  module: ModulePageData;
}

export function ModulePageView({ module }: ModulePageViewProps) {
  const showAnalytics = module.slug === "ai-analytics" || module.slug === "ai-copilot";

  return (
    <div className="space-y-6">
      <PageHeader
        title={module.title}
        description={module.description}
        action={
          module.primaryAction ? (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              {module.primaryAction}
            </button>
          ) : (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm text-text-muted hover:text-text"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          )
        }
      />

      <StatGrid stats={module.stats} />

      <FeatureGrid features={module.features} title="Module Features" />

      {module.tableData.length > 0 && (
        <DataTable
          title={module.tableTitle}
          columns={module.tableColumns}
          data={module.tableData}
        />
      )}

      {showAnalytics && <AIAnalyticsSection />}
    </div>
  );
}