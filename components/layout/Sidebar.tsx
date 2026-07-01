"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Users,
  Bell,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/crm/owner-listings", label: "Owner Listings", icon: Users },
  { href: "/crm/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/leases", label: "Leases", icon: FileText },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Building2 className="size-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Menavid</p>
              <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">
                Property Intelligence
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-[11px] text-sidebar-foreground/40 text-center">
            Menavid Realtors © {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
