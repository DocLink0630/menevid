import { getCurrentUser } from "@/lib/auth";
import {
  getPortfolioSummary,
  getUpcomingRenewals,
  getOverduePayments,
  getRecentActivity,
} from "@/lib/actions/reports";
import { formatDate } from "@/lib/utils/format";
import { buildExcelBuffer, excelResponse } from "@/lib/utils/excel-export";

const REPORT_TYPES = ["portfolio", "renewals", "overdue", "activity"] as const;
type ReportType = (typeof REPORT_TYPES)[number];

function isReportType(value: string | null): value is ReportType {
  return REPORT_TYPES.includes(value as ReportType);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!isReportType(type)) {
    return new Response("Invalid report type", { status: 400 });
  }

  const dateStamp = new Date().toISOString().slice(0, 10);

  if (type === "portfolio") {
    const summary = await getPortfolioSummary();
    const buffer = buildExcelBuffer(
      "Portfolio Summary",
      ["Metric", "Value"],
      [
        ["Total Properties", summary.totalProperties],
        ["Currently Rented", summary.currentlyRented],
        ["Available", summary.available],
        ["Temporarily Unavailable", summary.temporarilyUnavailable],
        ["Listed for Sale", summary.listedForSale],
        ["Active Leases", summary.totalActiveLeases],
      ],
    );
    return excelResponse(buffer, `portfolio-summary-${dateStamp}.xlsx`);
  }

  if (type === "renewals") {
    const renewals = await getUpcomingRenewals();
    const buffer = buildExcelBuffer(
      "Upcoming Renewals",
      ["Property", "Unit", "Tenant", "End Date", "Rent (LKR)"],
      renewals.map((r) => [
        r.propertyName,
        r.unitNumber ?? "",
        r.tenantName,
        formatDate(r.endDate),
        r.rentAmount,
      ]),
    );
    return excelResponse(buffer, `upcoming-renewals-${dateStamp}.xlsx`);
  }

  if (type === "overdue") {
    const payments = await getOverduePayments();
    const buffer = buildExcelBuffer(
      "Overdue Payments",
      ["Property", "Unit", "Tenant", "Due Date", "Amount (LKR)"],
      payments.map((p) => [
        p.propertyName,
        p.unitNumber ?? "",
        p.tenantName,
        formatDate(p.dueDate),
        p.amount,
      ]),
    );
    return excelResponse(buffer, `overdue-payments-${dateStamp}.xlsx`);
  }

  const activity = await getRecentActivity(50);
  const buffer = buildExcelBuffer(
    "Recent Activity",
    ["Action", "Entity", "User", "Date"],
    activity.map((a) => [
      a.action,
      a.entity,
      a.userName,
      formatDate(a.createdAt),
    ]),
  );
  return excelResponse(buffer, `activity-log-${dateStamp}.xlsx`);
}
