import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useInventory } from "@/hooks/use-inventory";
import { AppSidebar } from "@/components/AppSidebar";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "Reports — SmartStock" },
      { name: "description", content: "Generate inventory reports and analytics" },
    ],
  }),
});

function ReportsPage() {
  const { user, role, signOut } = useAuth();
  const { items, logs } = useInventory();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  const exportCSV = () => {
    if (items.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Name", "SKU", "Category", "Quantity", "Min Qty", "Unit", "Status", "Updated"];
    const rows = items.map((i) => [
      i.name,
      i.sku,
      i.category ?? "",
      i.quantity.toString(),
      i.min_quantity.toString(),
      i.unit,
      i.status,
      new Date(i.updated_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartstock-inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onSignOut={signOut} userName={userName} userRole={role ?? "staff"} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pt-16 lg:px-8 lg:pt-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate and export inventory reports
              </p>
            </div>
            <Button onClick={exportCSV} size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
              <div className="rounded-full bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">No reports available</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Add inventory items to generate reports and analytics
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Summary card */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-card-foreground">Inventory Summary</h2>
                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between border-b border-border pb-2">
                    <dt className="text-sm text-muted-foreground">Total Items</dt>
                    <dd className="text-sm font-medium tabular-nums">{items.length}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <dt className="text-sm text-muted-foreground">Total Stock</dt>
                    <dd className="text-sm font-medium tabular-nums">
                      {items.reduce((s, i) => s + i.quantity, 0).toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <dt className="text-sm text-muted-foreground">In Stock</dt>
                    <dd className="text-sm font-medium tabular-nums text-success">
                      {items.filter((i) => i.status === "in_stock").length}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <dt className="text-sm text-muted-foreground">Low Stock</dt>
                    <dd className="text-sm font-medium tabular-nums text-warning-foreground">
                      {items.filter((i) => i.status === "low_stock").length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Out of Stock</dt>
                    <dd className="text-sm font-medium tabular-nums text-destructive">
                      {items.filter((i) => i.status === "out_of_stock").length}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Recent changes */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-card-foreground">Recent Changes</h2>
                {logs.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {logs.slice(0, 8).map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          <span className="capitalize font-medium text-foreground">{log.action}</span>{" "}
                          {log.item_name}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
