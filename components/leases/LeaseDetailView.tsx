"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentScheduleTable } from "@/components/leases/PaymentScheduleTable";
import { RentRevisionHistory } from "@/components/leases/RentRevisionHistory";
import { RenewLeaseDialog } from "@/components/leases/RenewLeaseDialog";
import { DepositRefundForm } from "@/components/leases/DepositRefundForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { markLeaseExpired } from "@/lib/actions/leases";
import {
  decodePaymentDue,
  paymentFrequencyLabel,
} from "@/lib/utils/payment-frequency";
import type { LeaseStatus } from "@prisma/client";

type LeaseDetailViewProps = {
  lease: {
    id: string;
    tenantName: string;
    tenantPhone: string | null;
    tenantEmail: string | null;
    tenantNic: string | null;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    depositAmount: number | null;
    depositRefunded: boolean;
    depositRefundDate: Date | null;
    depositRefundNote: string | null;
    paymentDueDay: number;
    status: LeaseStatus;
    property: { id: string; name: string; unitNumber: string | null };
    payments: {
      id: string;
      dueDate: Date;
      amount: number;
      paidDate: Date | null;
      isPaid: boolean;
    }[];
    rentRevisions: {
      id: string;
      previousRent: number;
      newRent: number;
      effectiveDate: Date;
      note: string | null;
    }[];
  };
};

export function LeaseDetailView({ lease }: LeaseDetailViewProps) {
  const router = useRouter();
  const [renewOpen, setRenewOpen] = useState(false);
  const [expireOpen, setExpireOpen] = useState(false);
  const [expiring, setExpiring] = useState(false);

  async function handleExpire() {
    setExpiring(true);
    const result = await markLeaseExpired(lease.id);
    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lease marked as expired");
      router.refresh();
    }
    setExpiring(false);
    setExpireOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <ButtonLink variant="outline" href={`/leases/${lease.id}/edit`}>
          Edit
        </ButtonLink>
        {lease.status === "ACTIVE" ? (
          <>
            <Button onClick={() => setRenewOpen(true)}>Renew</Button>
            <Button variant="outline" onClick={() => setExpireOpen(true)}>
              Mark Expired
            </Button>
          </>
        ) : null}
        <a
          href={`/leases/${lease.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Generate PDF
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Lease Summary
            <Badge>{lease.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-muted-foreground">Property:</span>{" "}
            <Link href={`/properties/${lease.property.id}`} className="hover:underline">
              {lease.property.name}
              {lease.property.unitNumber ? ` (${lease.property.unitNumber})` : ""}
            </Link>
          </div>
          <div><span className="text-muted-foreground">Tenant:</span> {lease.tenantName}</div>
          <div><span className="text-muted-foreground">Phone:</span> {lease.tenantPhone ?? "-"}</div>
          <div><span className="text-muted-foreground">Email:</span> {lease.tenantEmail ?? "-"}</div>
          <div><span className="text-muted-foreground">NIC:</span> {lease.tenantNic ?? "-"}</div>
          <div><span className="text-muted-foreground">Period:</span> {formatDate(lease.startDate)} to {formatDate(lease.endDate)}</div>
          <div><span className="text-muted-foreground">Rent:</span> {formatCurrency(lease.rentAmount)}</div>
          <div><span className="text-muted-foreground">Deposit:</span> {formatCurrency(lease.depositAmount)}</div>
          <div>
            <span className="text-muted-foreground">Payment Frequency:</span>{" "}
            {paymentFrequencyLabel(
              decodePaymentDue(lease.paymentDueDay).frequencyMonths,
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Payment Due Day:</span>{" "}
            {decodePaymentDue(lease.paymentDueDay).day}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rent Revision History</CardTitle></CardHeader>
        <CardContent>
          <RentRevisionHistory revisions={lease.rentRevisions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment Schedule</CardTitle></CardHeader>
        <CardContent>
          <PaymentScheduleTable payments={lease.payments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Deposit Refund</CardTitle></CardHeader>
        <CardContent>
          <DepositRefundForm
            leaseId={lease.id}
            depositRefunded={lease.depositRefunded}
            depositRefundDate={lease.depositRefundDate}
            depositRefundNote={lease.depositRefundNote}
          />
        </CardContent>
      </Card>

      <RenewLeaseDialog
        leaseId={lease.id}
        currentRent={lease.rentAmount}
        currentEndDate={lease.endDate}
        open={renewOpen}
        onOpenChange={setRenewOpen}
      />

      <ConfirmDialog
        open={expireOpen}
        onOpenChange={setExpireOpen}
        title="Mark Lease Expired"
        description="This will set the lease status to EXPIRED and mark the property as AVAILABLE."
        confirmLabel="Mark Expired"
        onConfirm={handleExpire}
        loading={expiring}
      />
    </div>
  );
}
