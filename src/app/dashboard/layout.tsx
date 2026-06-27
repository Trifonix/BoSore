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
    <div className="dashboard-layout-marker dashboard-shell flex min-h-screen">
      <DashboardSidebar
        userName={formatDisplayName(session.user.name, session.user.email)}
        userImage={session.user.image}
      />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
