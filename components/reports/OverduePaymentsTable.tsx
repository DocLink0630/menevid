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

type OverduePayment = {
  id: string;
  leaseId: string;
  propertyName: string;
  tenantName: string;
  dueDate: Date;
  amount: number;
};

export function OverduePaymentsTable({
  payments,
}: {
  payments: OverduePayment[];
}) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">No overdue payments.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Days Overdue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <Link href={`/leases/${p.leaseId}`} className="hover:underline">
                {p.propertyName}
              </Link>
            </TableCell>
            <TableCell>{p.tenantName}</TableCell>
            <TableCell>{formatDate(p.dueDate)}</TableCell>
            <TableCell>{formatCurrency(p.amount)}</TableCell>
            <TableCell>{Math.abs(daysUntil(p.dueDate))} days</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
