import { requireAuth } from "@/lib/auth/session";
import { formatDisplayName } from "@/lib/format-name";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="dashboard-layout-marker flex min-h-screen bg-white text-foreground">
      <DashboardSidebar
        userName={formatDisplayName(session.user.name, session.user.email)}
        userImage={session.user.image}
      />
      <main className="flex-1 overflow-auto px-8 py-8">{children}</main>
    </div>
  );
}
