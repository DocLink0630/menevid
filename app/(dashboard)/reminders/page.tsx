import { PageHeader } from "@/components/shared/PageHeader";
import { ReminderList } from "@/components/reminders/ReminderList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReminders } from "@/lib/actions/reminders";

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
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="listings">New Listings</TabsTrigger>
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
