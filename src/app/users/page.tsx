import { AppShell } from "@/components/layout/AppShell";
import { UserManagementView } from "@/components/auth/UserManagementView";

export default function UsersPage() {
  return (
    <AppShell showCopilot={false}>
      <UserManagementView />
    </AppShell>
  );
}