"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  CalendarClock,
  CreditCard,
  Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import {
  dismissReminder,
  markReminderRead,
} from "@/lib/actions/reminders";
import type { ReminderStatus, ReminderType } from "@prisma/client";

type Reminder = {
  id: string;
  title: string;
  message: string;
  dueDate: Date;
  status: ReminderStatus;
  type: ReminderType;
};

function reminderIcon(type: ReminderType) {
  switch (type) {
    case "RENEWAL_6_WEEKS":
    case "RENEWAL_4_WEEKS":
      return CalendarClock;
    case "PAYMENT_DUE":
      return CreditCard;
    case "NEW_LISTING":
      return Home;
    default:
      return Bell;
  }
}

export function ReminderItem({ reminder }: { reminder: Reminder }) {
  const router = useRouter();
  const Icon = reminderIcon(reminder.type);

  async function handleDismiss() {
    const result = await dismissReminder(reminder.id);
    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Reminder dismissed");
      router.refresh();
    }
  }

  async function handleRead() {
    const result = await markReminderRead(reminder.id);
    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="flex gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{reminder.title}</p>
            <Badge variant="outline">{reminder.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{reminder.message}</p>
          <p className="text-xs text-muted-foreground">
            Due {formatDate(reminder.dueDate)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {reminder.status !== "READ" ? (
          <Button size="xs" variant="outline" onClick={handleRead}>
            Mark Read
          </Button>
        ) : null}
        <Button size="xs" variant="ghost" onClick={handleDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
