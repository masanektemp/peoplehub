import { AppShell } from "@/components/layout/AppShell";
import { FeedbackView } from "@/components/feedback/FeedbackView";

export default function FeedbackPage() {
  return (
    <AppShell showCopilot={false}>
      <FeedbackView />
    </AppShell>
  );
}
