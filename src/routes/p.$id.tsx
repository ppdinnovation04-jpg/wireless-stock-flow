import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type InventoryItem = Tables<"inventory_items">;

export const Route = createFileRoute("/p/$id")({
  component: ProductInfoPage,
  head: () => ({
    meta: [
      { title: "Product Info — SmartStock" },
      { name: "description", content: "Product details and live stock" },
    ],
  }),
});

const statusStyles: Record<string, { label: string; className: string }> = {
  in_stock: { label: "In Stock", className: "bg-success/10 text-success" },
  low_stock: { label: "Low Stock", className: "bg-warning/15 text-warning-foreground" },
  out_of_stock: { label: "Out of Stock", className: "bg-destructive/10 text-destructive" },
};

function ProductInfoPage() {
  const { id } = Route.useParams();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!active) return;
      if (error || !data) setNotFound(true);
      else setItem(data);
      setLoading(false);
    };
    fetchItem();

    const sub = supabase
      .channel(`product-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "inventory_items", filter: `id=eq.${id}` },
        (payload) => setItem(payload.new as InventoryItem),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(sub);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Product not found</h1>
        <p className="text-sm text-muted-foreground">This QR code is no longer valid.</p>
        <Link to="/" className="mt-2 text-sm font-medium text-primary hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const status = statusStyles[item.status] ?? statusStyles.in_stock;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {item.image_url && (
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{item.name}</h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{item.sku}</p>
            </div>
            <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", status.className)}>
              {status.label}
            </span>
          </div>

          {item.description && (
            <p className="mt-4 text-sm text-muted-foreground">{item.description}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {item.quantity} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Min Quantity</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{item.min_quantity}</p>
            </div>
            <div className="col-span-2 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="mt-1 text-sm font-medium text-foreground">{item.category || "—"}</p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Last updated {new Date(item.updated_at).toLocaleString()}
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
