import { ReminderItem } from "@/components/reminders/ReminderItem";
import type { ReminderStatus, ReminderType } from "@prisma/client";

type Reminder = {
  id: string;
  title: string;
  message: string;
  dueDate: Date;
  status: ReminderStatus;
  type: ReminderType;
};

type ReminderListProps = {
  reminders: Reminder[];
  filter?: "all" | "renewals" | "payments" | "listings";
};

export function ReminderList({ reminders, filter = "all" }: ReminderListProps) {
  const filtered = reminders.filter((r) => {
    if (filter === "renewals") {
      return r.type === "RENEWAL_6_WEEKS" || r.type === "RENEWAL_4_WEEKS";
    }
    if (filter === "payments") return r.type === "PAYMENT_DUE";
    if (filter === "listings") return r.type === "NEW_LISTING";
    return true;
  });

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No reminders in this category.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((r) => (
        <ReminderItem key={r.id} reminder={r} />
      ))}
    </div>
  );
}
