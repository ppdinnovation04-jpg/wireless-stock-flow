import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";

export const Route = createFileRoute("/")({
  component: IndexPage,
  head: () => ({
    meta: [
      { title: "SmartStock — Warehouse Inventory Management" },
      { name: "description", content: "Real-time wireless warehouse inventory management system" },
      { property: "og:title", content: "SmartStock — Warehouse Inventory Management" },
      { property: "og:description", content: "Real-time wireless warehouse inventory management system" },
    ],
  }),
});

function IndexPage() {
  const navigate = Route.useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/login" });
      }
      setChecking(false);
    });
  }, [navigate]);

  if (!checking) return null;
  // (kept for safety — render spinner while checking)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Package className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  );
}
