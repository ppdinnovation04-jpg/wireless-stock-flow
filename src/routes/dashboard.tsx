import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useInventory } from "@/hooks/use-inventory";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardStats } from "@/components/DashboardStats";
import { ActivityFeed } from "@/components/ActivityFeed";
import { StockChart } from "@/components/StockChart";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — SmartStock" },
      { name: "description", content: "SmartStock warehouse inventory dashboard" },
    ],
  }),
});

function DashboardPage() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const { items, logs, loading, stats } = useInventory();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onSignOut={signOut} userName={userName} userRole={role ?? "staff"} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pt-16 lg:px-8 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time overview of your warehouse inventory
            </p>
          </div>

          <DashboardStats stats={stats} />

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-card-foreground">Stock by Category</h2>
              <StockChart items={items} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-card-foreground">Recent Activity</h2>
              <ActivityFeed logs={logs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
