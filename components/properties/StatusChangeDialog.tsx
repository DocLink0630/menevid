"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { updatePropertyStatus } from "@/lib/actions/properties";
import type { PropertyStatus } from "@prisma/client";

const statuses: PropertyStatus[] = [
  "AVAILABLE",
  "RENTED",
  "SOLD",
  "TEMPORARILY_UNAVAILABLE",
];

type StatusChangeDialogProps = {
  propertyId: string;
  currentStatus: PropertyStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StatusChangeDialog({
  propertyId,
  currentStatus,
  open,
  onOpenChange,
}: StatusChangeDialogProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PropertyStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [unavailableUntil, setUnavailableUntil] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const result = await updatePropertyStatus(
      propertyId,
      status,
      note,
      unavailableUntil || undefined,
    );
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Status updated");
    onOpenChange(false);
    router.refresh();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Property Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as PropertyStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {status === "TEMPORARILY_UNAVAILABLE" ? (
            <div className="space-y-2">
              <Label>Temporarily Unavailable Until</Label>
              <Input
                type="date"
                value={unavailableUntil}
                onChange={(e) => setUnavailableUntil(e.target.value)}
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for status change..."
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
