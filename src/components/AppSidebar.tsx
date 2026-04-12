import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onSignOut: () => void;
  userName: string;
  userRole: string;
}

const navItems = [
  { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory" as const, label: "Inventory", icon: Package },
  { to: "/reports" as const, label: "Reports", icon: FileText },
];

export function AppSidebar({ onSignOut, userName, userRole }: AppSidebarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 text-sidebar-foreground/60 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Package className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">SmartStock</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 pt-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName || "User"}</p>
              <p className="text-xs capitalize text-sidebar-foreground/50">{userRole}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
