"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  getUnreadReminderCount,
  getRecentReminders,
} from "@/lib/actions/reminders";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type RecentReminder = Awaited<ReturnType<typeof getRecentReminders>>[number];

export function ReminderBell() {
  const [count, setCount] = useState(0);
  const [reminders, setReminders] = useState<RecentReminder[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const [c, r] = await Promise.all([
        getUnreadReminderCount(),
        getRecentReminders(),
      ]);
      setCount(c);
      setReminders(r);
    }
    load();
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative",
        )}
      >
        <Bell className="size-5" />
        {count > 0 ? (
          <Badge className="absolute -right-0.5 -top-0.5 size-5 justify-center rounded-full border-2 border-background bg-primary p-0 text-[10px] text-primary-foreground">
            {count > 9 ? "9+" : count}
          </Badge>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg">
        <div className="border-b px-4 py-3">
          <h4 className="font-semibold">Reminders</h4>
          <p className="text-xs text-muted-foreground">Recent notifications</p>
        </div>
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <BellOff className="mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No pending reminders</p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {reminders.map((r) => (
              <Link
                key={r.id}
                href="/reminders"
                onClick={() => setOpen(false)}
                className="block border-b px-4 py-3 transition-colors hover:bg-muted/60 last:border-0"
              >
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {r.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Due {formatDate(r.dueDate)}
                </p>
              </Link>
            ))}
          </div>
        )}
        <div className="border-t p-2">
          <Link
            href="/reminders"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full",
            )}
          >
            View all reminders
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
