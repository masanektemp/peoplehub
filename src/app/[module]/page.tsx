import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ModulePageView } from "@/components/modules/ModulePageView";
import { getModule, toModulePageData } from "@/lib/modules";

export const dynamic = "force-dynamic";

interface ModulePageProps {
  params: Promise<{ module: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { module: slug } = await params;
  const mod = getModule(slug);

  if (!mod) notFound();

  const copilotOpen = slug === "ai-copilot";

  return (
    <AppShell defaultCopilotOpen={copilotOpen}>
      <ModulePageView module={toModulePageData(mod)} />
    </AppShell>
  );
}