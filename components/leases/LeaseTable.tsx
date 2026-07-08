import { ButtonLink } from "@/components/shared/ButtonLink";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/format";
import type { LeaseStatus } from "@prisma/client";

type LeaseRow = {
  id: string;
  propertyName: string;
  unitNumber: string | null;
  tenantName: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  status: LeaseStatus;
};

type LeaseTableProps = {
  leases: LeaseRow[];
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export function LeaseTable({
  leases,
  page,
  totalPages,
  searchParams,
}: LeaseTableProps) {
  const in42Days = new Date();
  in42Days.setDate(in42Days.getDate() + 42);

  return (
    <DataTable
      columns={[
        {
          header: "Property",
          cell: (row) => row.propertyName,
        },
        { header: "Unit", cell: (row) => row.unitNumber ?? "-" },
        { header: "Tenant", cell: (row) => row.tenantName },
        { header: "Start", cell: (row) => formatDate(row.startDate) },
        { header: "End", cell: (row) => formatDate(row.endDate) },
        {
          header: "Rent (LKR)",
          cell: (row) => formatCurrency(row.rentAmount),
        },
        {
          header: "Status",
          cell: (row) => <Badge variant="outline">{row.status}</Badge>,
        },
        {
          header: "Days Until Expiry",
          cell: (row) => {
            const days = daysUntil(row.endDate);
            return days > 0 ? `${days} days` : days === 0 ? "Today" : "Expired";
          },
        },
        {
          header: "Actions",
          cell: (row) => (
            <ButtonLink variant="ghost" size="xs" href={`/leases/${row.id}`}>
              View
            </ButtonLink>
          ),
        },
      ]}
      data={leases}
      keyExtractor={(row) => row.id}
      rowClassName={(row) => {
        if (
          row.status === "ACTIVE" &&
          new Date(row.endDate) <= in42Days
        ) {
          return "border-l-4 border-l-amber-400";
        }
        return undefined;
      }}
      page={page}
      totalPages={totalPages}
      basePath="/leases"
      searchParams={searchParams}
    />
  );
}
