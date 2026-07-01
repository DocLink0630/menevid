import { ButtonLink } from "@/components/shared/ButtonLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLogTable } from "@/components/reports/ActivityLogTable";
import {
  getPortfolioSummary,
  getUpcomingRenewals,
  getOverduePayments,
  getRecentActivity,
} from "@/lib/actions/reports";
import { getUnreadReminderCount } from "@/lib/actions/reminders";

export default async function DashboardPage() {
  const [summary, renewals, overdue, activity, reminderCount] =
    await Promise.all([
      getPortfolioSummary(),
      getUpcomingRenewals(),
      getOverduePayments(),
      getRecentActivity(10),
      getUnreadReminderCount(),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to Menavid Property Intelligence"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Pending Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{reminderCount}</p>
            <ButtonLink size="sm" variant="outline" href="/reminders">
              View
            </ButtonLink>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Upcoming Renewals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{renewals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Overdue Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {overdue.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active Leases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary.totalActiveLeases}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLogTable activities={activity} />
        </CardContent>
      </Card>
    </div>
  );
}
