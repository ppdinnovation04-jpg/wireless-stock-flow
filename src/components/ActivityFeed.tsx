import { formatDistanceToNow } from "date-fns";
import { Plus, Pencil, Trash2, PackageOpen } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type ActivityLog = Tables<"activity_logs">;

const actionConfig = {
  created: { icon: Plus, color: "text-success", bg: "bg-success/10", label: "Added" },
  updated: { icon: Pencil, color: "text-primary", bg: "bg-primary/10", label: "Updated" },
  deleted: { icon: Trash2, color: "text-destructive", bg: "bg-destructive/10", label: "Removed" },
} as const;

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <PackageOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">No activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Activity will appear here as you manage inventory
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.slice(0, 10).map((log) => {
        const config = actionConfig[log.action as keyof typeof actionConfig] ?? actionConfig.updated;
        const Icon = config.icon;
        return (
          <div key={log.id} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
            <div className={`mt-0.5 rounded-md p-1.5 ${config.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{config.label}</span>{" "}
                <span className="text-muted-foreground">{log.item_name}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
