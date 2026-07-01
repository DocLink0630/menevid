"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { refundDeposit } from "@/lib/actions/leases";
import { formatDate } from "@/lib/utils/format";

type DepositRefundFormProps = {
  leaseId: string;
  depositRefunded: boolean;
  depositRefundDate: Date | null;
  depositRefundNote: string | null;
};

export function DepositRefundForm({
  leaseId,
  depositRefunded,
  depositRefundDate,
  depositRefundNote,
}: DepositRefundFormProps) {
  const router = useRouter();
  const [refundDate, setRefundDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (depositRefunded) {
    return (
      <div className="text-sm space-y-1">
        <p><span className="text-muted-foreground">Refund Date:</span> {formatDate(depositRefundDate)}</p>
        {depositRefundNote ? (
          <p><span className="text-muted-foreground">Note:</span> {depositRefundNote}</p>
        ) : null}
      </div>
    );
  }

  async function handleSubmit() {
    setLoading(true);
    const result = await refundDeposit(leaseId, { refundDate, note });
    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Deposit refund recorded");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3 max-w-md">
      <div className="space-y-2">
        <Label>Refund Date</Label>
        <Input type="date" value={refundDate} onChange={(e) => setRefundDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Note</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <Button onClick={handleSubmit} disabled={loading || !refundDate}>
        {loading ? "Saving..." : "Record Refund"}
      </Button>
    </div>
  );
}
