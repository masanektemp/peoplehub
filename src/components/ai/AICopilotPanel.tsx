"use client";

import { useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Suggest promotions for high performers",
  "Generate attendance report this month",
  "List contracts expiring in 30 days",
  "Analyze turnover trend by department",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Welcome! I'm the MSNC PeopleHub AI Copilot. I can help generate letters, reports, promotion suggestions, and automatic HR analysis.",
  },
];

interface AICopilotPanelProps {
  onClose: () => void;
}

export function AICopilotPanel({ onClose }: AICopilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAutoReply(text),
      };
      setMessages((prev) => [...prev, reply]);
    }, 800);
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-text">AI Copilot</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
              msg.role === "user"
                ? "ml-auto bg-primary text-white"
                : "bg-surface-elevated text-text-muted"
            )}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.slice(0, 2).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
            >
              {s.length > 35 ? s.slice(0, 35) + "…" : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask AI Copilot..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            className="rounded-lg bg-primary p-2 text-white transition-colors hover:bg-primary-hover"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function getAutoReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("promot") || lower.includes("kenaikan")) {
    return "Based on KPI analysis, I recommend 3 promotion candidates: Ahmad Rizal (KPI 94%), Siti Aminah (KPI 91%), and Muhammad Haziq (KPI 89%). All have completed mandatory training with no performance warnings.";
  }
  if (lower.includes("report") || lower.includes("laporan")) {
    return "July 2026 attendance report generated. Average attendance: 88.2%. 23 employees have not clocked in today. 8 on medical leave. I can export to PDF or Power BI.";
  }
  if (lower.includes("contract") || lower.includes("kontrak")) {
    return "5 contracts expiring in the next 30 days: Nurul Izzati (15 Aug), Faizal Rahman (22 Aug), and 3 others. Recommendation: start renewal process now.";
  }
  if (lower.includes("turnover")) {
    return "Turnover trend shows +5% increase this month. Most affected department: Engineering (3 employees). Main cause: higher salary offers elsewhere. Recommendation: review salary structure and retention program.";
  }
  return "I understand your request. I'm analyzing HR data to provide the best recommendation. Please wait or specify a module (Attendance, Leave, Payroll, etc.).";
}