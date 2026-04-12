import { BarChart3 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type InventoryItem = Tables<"inventory_items">;

export function StockChart({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">No data to visualize</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Charts will appear once you add inventory items
        </p>
      </div>
    );
  }

  // Group by category
  const categories: Record<string, { total: number; count: number }> = {};
  items.forEach((item) => {
    const cat = item.category || "Uncategorized";
    if (!categories[cat]) categories[cat] = { total: 0, count: 0 };
    categories[cat].total += item.quantity;
    categories[cat].count += 1;
  });

  const sorted = Object.entries(categories)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8);
  const maxVal = Math.max(...sorted.map(([, v]) => v.total), 1);

  return (
    <div className="space-y-3">
      {sorted.map(([category, data]) => (
        <div key={category} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">{category}</span>
            <span className="tabular-nums text-muted-foreground">
              {data.total.toLocaleString()} <span className="text-xs">({data.count} items)</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(data.total / maxVal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
