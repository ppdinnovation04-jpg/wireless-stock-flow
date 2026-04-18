import { useState } from "react";
import { Search, Plus, Pencil, Trash2, PackageOpen, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryDialog } from "@/components/InventoryDialog";
import { QRCodeDialog } from "@/components/QRCodeDialog";
import { toast } from "sonner";

type InventoryItem = Tables<"inventory_items">;

interface Props {
  items: InventoryItem[];
  loading: boolean;
  isAdmin: boolean;
  onAdd: (item: any) => Promise<any>;
  onUpdate: (id: string, updates: Partial<InventoryItem>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  in_stock: { label: "In Stock", className: "bg-success/10 text-success" },
  low_stock: { label: "Low Stock", className: "bg-warning/15 text-warning-foreground" },
  out_of_stock: { label: "Out of Stock", className: "bg-destructive/10 text-destructive" },
};

export function InventoryTable({ items, loading, isAdmin, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [qrItem, setQrItem] = useState<InventoryItem | null>(null);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (data: any) => {
    try {
      if (editItem) {
        await onUpdate(editItem.id, data);
        toast.success("Item updated successfully");
      } else {
        await onAdd(data);
        toast.success("Item added successfully");
      }
      setDialogOpen(false);
      setEditItem(null);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete "${item.name}"? This action cannot be undone.`)) return;
    try {
      await onDelete(item.id);
      toast.success("Item deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <Button
          onClick={() => {
            setEditItem(null);
            setDialogOpen(true);
          }}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <PackageOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            {items.length === 0 ? "No inventory items yet" : "No matching items"}
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {items.length === 0
              ? "Add your first item to start tracking inventory"
              : "Try adjusting your search or filter"}
          </p>
          {items.length === 0 && (
            <Button
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => {
                setEditItem(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">SKU</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Category</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Qty</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const status = statusStyles[item.status] ?? statusStyles.in_stock;
                return (
                  <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        {item.description && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{item.category || "—"}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {item.quantity} <span className="text-xs text-muted-foreground">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", status.className)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQrItem(item)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="View QR code"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditItem(item);
                            setDialogOpen(true);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <InventoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editItem}
        onSave={handleSave}
      />

      <QRCodeDialog
        open={!!qrItem}
        onOpenChange={(o) => !o && setQrItem(null)}
        item={qrItem}
      />
    </div>
  );
}
