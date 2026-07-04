import { PageHeader } from "@/components/shared/PageHeader";
import { SummaryCards } from "@/components/reports/SummaryCards";
import { UpcomingRenewalsTable } from "@/components/reports/UpcomingRenewalsTable";
import { OverduePaymentsTable } from "@/components/reports/OverduePaymentsTable";
import { ActivityLogTable } from "@/components/reports/ActivityLogTable";
import { ExportReportButton } from "@/components/reports/ExportReportButton";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
          <CardAction>
            <ExportReportButton type="portfolio" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <SummaryCards summary={summary} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals</CardTitle>
          <CardAction>
            <ExportReportButton type="renewals" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <UpcomingRenewalsTable renewals={renewals} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Overdue Payments</CardTitle>
          <CardAction>
            <ExportReportButton type="overdue" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <OverduePaymentsTable payments={overdue} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardAction>
            <ExportReportButton type="activity" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <ActivityLogTable activities={activity} />
        </CardContent>
      </Card>
    </div>
  );
}
