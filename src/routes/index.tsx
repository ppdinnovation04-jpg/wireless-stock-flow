import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SmartStock — Warehouse Inventory Management" },
      { name: "description", content: "Real-time wireless warehouse inventory management system" },
      { property: "og:title", content: "SmartStock — Warehouse Inventory Management" },
      { property: "og:description", content: "Real-time wireless warehouse inventory management system" },
    ],
  }),
});

function Index() {
  // Redirect to dashboard or login
  if (typeof window !== "undefined") {
    // Client-side check
    return <IndexRedirect />;
  }
  return null;
}

function IndexRedirect() {
  const navigate = Route.useNavigate();
  const { useEffect, useState } = require("react");
  // We can't use hooks conditionally, so let's redirect via effect in the component
  return <ClientRedirect />;
}

function ClientRedirect() {
  const navigate = Route.useNavigate();
  
  import("@/integrations/supabase/client").then(({ supabase }) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/login" });
      }
    });
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
