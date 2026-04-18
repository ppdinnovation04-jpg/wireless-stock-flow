import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useInventory } from "@/hooks/use-inventory";
import { AppSidebar } from "@/components/AppSidebar";
import { InventoryTable } from "@/components/InventoryTable";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
  head: () => ({
    meta: [
      { title: "Inventory — SmartStock" },
      { name: "description", content: "Manage your warehouse inventory items" },
    ],
  }),
});

function InventoryPage() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const { items, loading, addItem, updateItem, deleteItem } = useInventory();

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and track all warehouse items
            </p>
          </div>
          <InventoryTable
            items={items}
            loading={loading}
            isAdmin={role === "admin"}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        </div>
      </main>
    </div>
  );
}
