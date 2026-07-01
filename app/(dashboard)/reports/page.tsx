import { PageHeader } from "@/components/shared/PageHeader";
import { SummaryCards } from "@/components/reports/SummaryCards";
import { UpcomingRenewalsTable } from "@/components/reports/UpcomingRenewalsTable";
import { OverduePaymentsTable } from "@/components/reports/OverduePaymentsTable";
import { ActivityLogTable } from "@/components/reports/ActivityLogTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPortfolioSummary,
  getUpcomingRenewals,
  getOverduePayments,
  getRecentActivity,
} from "@/lib/actions/reports";

export default async function ReportsPage() {
  const [summary, renewals, overdue, activity] = await Promise.all([
    getPortfolioSummary(),
    getUpcomingRenewals(),
    getOverduePayments(),
    getRecentActivity(50),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Portfolio analytics and activity"
      />
      <SummaryCards summary={summary} />
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals</CardTitle>
        </CardHeader>
        <CardContent>
          <UpcomingRenewalsTable renewals={renewals} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Overdue Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <OverduePaymentsTable payments={overdue} />
        </CardContent>
      </Card>
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
