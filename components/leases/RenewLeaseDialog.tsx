"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Currency } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { renewLease } from "@/lib/actions/leases";
import { CURRENCIES } from "@/lib/constants/money";

type RenewLeaseDialogProps = {
  leaseId: string;
  currentRent: number;
  currentCurrency: Currency;
  currentEndDate: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RenewLeaseDialog({
  leaseId,
  currentRent,
  currentCurrency,
  currentEndDate,
  open,
  onOpenChange,
}: RenewLeaseDialogProps) {
  const router = useRouter();
  const [newEndDate, setNewEndDate] = useState("");
  const [newRent, setNewRent] = useState(String(currentRent));
  const [currency, setCurrency] = useState<Currency>(currentCurrency);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const result = await renewLease(leaseId, {
      newEndDate,
      newRentAmount: Number(newRent),
      currency,
      note,
    });
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Lease renewed");
    onOpenChange(false);
    router.refresh();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew Lease</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current end date: {currentEndDate.toLocaleDateString("en-LK")}
          </p>
          <div className="space-y-2">
            <Label>New End Date *</Label>
            <Input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>New Rent Amount *</Label>
            <Input type="number" value={newRent} onChange={(e) => setNewRent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button onClick={handleSubmit} disabled={loading || !newEndDate} className="w-full">
            {loading ? "Renewing..." : "Renew Lease"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
