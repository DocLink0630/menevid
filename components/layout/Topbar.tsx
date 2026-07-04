"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReminderBell } from "@/components/layout/ReminderBell";
import { createClient } from "@/lib/supabase/client";

type TopbarProps = {
  userEmail: string;
  onMenuClick: () => void;
};

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function Topbar({ userEmail, onMenuClick }: TopbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="size-5" />
      </Button>
      <div className="flex-1" />
      <ReminderBell />
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2.5 sm:flex">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {getInitials(userEmail)}
          </div>
          <span className="text-base text-muted-foreground max-w-[180px] truncate">
            {userEmail}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="gap-1.5"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">
            {loggingOut ? "..." : "Logout"}
          </span>
        </Button>
      </div>
    </header>
  );
}
