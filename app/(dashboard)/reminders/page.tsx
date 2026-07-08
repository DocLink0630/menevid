import { PageHeader } from "@/components/shared/PageHeader";
import { ReminderList } from "@/components/reminders/ReminderList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReminders } from "@/lib/actions/reminders";
import { Bell, CalendarClock, CreditCard, Home } from "lucide-react";

export default async function RemindersPage() {
  const reminders = await getReminders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders"
        description="Your pending notifications and alerts"
      />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            <Bell className="size-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="renewals" className="gap-1.5">
            <CalendarClock className="size-4" />
            Renewals
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5">
            <CreditCard className="size-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="listings" className="gap-1.5">
            <Home className="size-4" />
            New Listings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <ReminderList reminders={reminders} filter="all" />
        </TabsContent>
        <TabsContent value="renewals" className="mt-4">
          <ReminderList reminders={reminders} filter="renewals" />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <ReminderList reminders={reminders} filter="payments" />
        </TabsContent>
        <TabsContent value="listings" className="mt-4">
          <ReminderList reminders={reminders} filter="listings" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
