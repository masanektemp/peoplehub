import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ModulePageView } from "@/components/modules/ModulePageView";
import { getModule, toModulePageData } from "@/lib/modules";

/** Shared shell for one static module route: /attendance, /announcement, … */
export function ModuleRoutePage({ slug }: { slug: string }) {
  const mod = getModule(slug);
  if (!mod) notFound();

  const copilotOpen = slug === "ai-copilot";

  return (
    <AppShell defaultCopilotOpen={copilotOpen}>
      <ModulePageView module={toModulePageData(mod)} />
    </AppShell>
  );
}
