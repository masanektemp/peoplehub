"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AICopilotPanel } from "@/components/ai/AICopilotPanel";

interface AppShellProps {
  children: React.ReactNode;
  defaultCopilotOpen?: boolean;
  showCopilot?: boolean;
}

export function AppShell({
  children,
  defaultCopilotOpen = false,
  showCopilot = true,
}: AppShellProps) {
  const [copilotOpen, setCopilotOpen] = useState(defaultCopilotOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          showCopilot={showCopilot}
          copilotOpen={copilotOpen}
          onToggleCopilot={() => setCopilotOpen((v) => !v)}
        />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
          {copilotOpen && <AICopilotPanel onClose={() => setCopilotOpen(false)} />}
        </div>
      </div>
    </div>
  );
}