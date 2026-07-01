import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/format";

type Renewal = {
  id: string;
  propertyName: string;
  unitNumber: string | null;
  tenantName: string;
  endDate: Date;
  rentAmount: number;
};

export function UpcomingRenewalsTable({ renewals }: { renewals: Renewal[] }) {
  if (renewals.length === 0) {
    return <p className="text-sm text-muted-foreground">No upcoming renewals.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Days Remaining</TableHead>
          <TableHead>Rent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {renewals.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <Link href={`/leases/${r.id}`} className="hover:underline">
                {r.propertyName}
              </Link>
            </TableCell>
            <TableCell>{r.unitNumber ?? "—"}</TableCell>
            <TableCell>{r.tenantName}</TableCell>
            <TableCell>{formatDate(r.endDate)}</TableCell>
            <TableCell>{daysUntil(r.endDate)} days</TableCell>
            <TableCell>{formatCurrency(r.rentAmount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
