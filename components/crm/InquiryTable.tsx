import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { DataTable } from "@/components/shared/DataTable";
import { formatDate } from "@/lib/utils/format";
import type { InquiryStatus } from "@prisma/client";

const statusColors: Record<InquiryStatus, string> = {
  NEW: "bg-emerald-100 text-emerald-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  QUALIFIED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

type InquiryRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: InquiryStatus;
  createdAt: Date;
  remarks: string | null;
  property: { id: string; name: string } | null;
};

type InquiryTableProps = {
  inquiries: InquiryRow[];
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export function InquiryTable({
  inquiries,
  page,
  totalPages,
  searchParams,
}: InquiryTableProps) {
  return (
    <DataTable
      columns={[
        {
          header: "Name",
          cell: (row) => (
            <Link href={`/crm/inquiries/${row.id}`} className="font-medium hover:underline">
              {row.name}
            </Link>
          ),
        },
        { header: "Phone", cell: (row) => row.phone ?? "—" },
        { header: "Email", cell: (row) => row.email ?? "—" },
        {
          header: "Linked Property",
          cell: (row) =>
            row.property ? (
              <Link href={`/properties/${row.property.id}`} className="hover:underline">
                {row.property.name}
              </Link>
            ) : (
              "—"
            ),
        },
        {
          header: "Status",
          cell: (row) => (
            <Badge variant="outline" className={statusColors[row.status]}>
              {row.status}
            </Badge>
          ),
        },
        { header: "Created", cell: (row) => formatDate(row.createdAt) },
        {
          header: "Remarks",
          cell: (row) => (
            <span className="max-w-[200px] truncate block">
              {row.remarks ?? "—"}
            </span>
          ),
        },
        {
          header: "Actions",
          cell: (row) => (
            <ButtonLink variant="ghost" size="xs" href={`/crm/inquiries/${row.id}`}>
              View
            </ButtonLink>
          ),
        },
      ]}
      data={inquiries}
      keyExtractor={(row) => row.id}
      page={page}
      totalPages={totalPages}
      basePath="/crm/inquiries"
      searchParams={searchParams}
    />
  );
}
