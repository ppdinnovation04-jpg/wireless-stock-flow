import { Package, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

interface Stats {
  totalItems: number;
  totalQuantity: number;
  lowStock: number;
  outOfStock: number;
}

export function DashboardStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "Total Quantity",
      value: stats.totalQuantity.toLocaleString(),
      icon: TrendingUp,
      color: "text-accent-foreground",
      bg: "bg-accent/15",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "text-warning-foreground",
      bg: "bg-warning/15",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-card-foreground">
            {stats.totalItems === 0 && card.label !== "Total Items" ? "—" : card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
