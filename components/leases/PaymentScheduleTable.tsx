"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { markPaymentPaid } from "@/lib/actions/leases";

type Payment = {
  id: string;
  dueDate: Date;
  amount: number;
  paidDate: Date | null;
  isPaid: boolean;
};

export function PaymentScheduleTable({ payments }: { payments: Payment[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleMarkPaid(id: string) {
    setLoadingId(id);
    const result = await markPaymentPaid(id);
    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Payment marked as paid");
      router.refresh();
    }
    setLoadingId(null);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Due Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Paid Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{formatDate(p.dueDate)}</TableCell>
            <TableCell>{formatCurrency(p.amount)}</TableCell>
            <TableCell>{p.paidDate ? formatDate(p.paidDate) : "—"}</TableCell>
            <TableCell>
              <Badge variant="outline" className={p.isPaid ? "bg-green-50" : ""}>
                {p.isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </TableCell>
            <TableCell>
              {!p.isPaid ? (
                <Button
                  size="xs"
                  variant="outline"
                  disabled={loadingId === p.id}
                  onClick={() => handleMarkPaid(p.id)}
                >
                  {loadingId === p.id ? "..." : "Mark Paid"}
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
