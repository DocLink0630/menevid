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
import {
  AlertCircle,
  Bell,
  CalendarClock,
  FileText,
} from "lucide-react";

export default async function DashboardPage() {
  const [summary, renewals, overdue, activity, reminderCount] =
    await Promise.all([
      getPortfolioSummary(),
      getUpcomingRenewals(),
      getOverduePayments(),
      getRecentActivity(10),
      getUnreadReminderCount(),
    ]);

  const statCards = [
    {
      title: "Pending Reminders",
      value: reminderCount,
      icon: Bell,
      action: { label: "View", href: "/reminders" },
    },
    {
      title: "Upcoming Renewals",
      value: renewals.length,
      icon: CalendarClock,
    },
    {
      title: "Overdue Payments",
      value: overdue.length,
      icon: AlertCircle,
      valueClassName: "text-destructive",
    },
    {
      title: "Active Leases",
      value: summary.totalActiveLeases,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to Menavid Property Intelligence"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent
                className={
                  card.action
                    ? "flex items-center justify-between"
                    : undefined
                }
              >
                <p
                  className={`text-3xl font-bold ${card.valueClassName ?? ""}`}
                >
                  {card.value}
                </p>
                {card.action ? (
                  <ButtonLink
                    size="sm"
                    variant="outline"
                    href={card.action.href}
                  >
                    {card.action.label}
                  </ButtonLink>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
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
