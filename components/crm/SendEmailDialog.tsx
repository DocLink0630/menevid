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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendEmail } from "@/lib/actions/crm";

type SendEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toEmail: string;
  toName: string;
  entityType: "inquiry" | "ownerListing";
  entityId: string;
};

export function SendEmailDialog({
  open,
  onOpenChange,
  toEmail,
  toName,
  entityType,
  entityId,
}: SendEmailDialogProps) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    const result = await sendEmail({
      toEmail,
      toName,
      subject,
      body,
      entityType,
      entityId,
    });
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    toast.success("Email sent");
    onOpenChange(false);
    setSubject("");
    setBody("");
    router.refresh();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={`${toName} <${toEmail}>`} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            onClick={handleSend}
            disabled={loading || !subject || !body}
            className="w-full"
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
