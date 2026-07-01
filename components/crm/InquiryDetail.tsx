"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendEmailDialog } from "@/components/crm/SendEmailDialog";
import { EmailLogList } from "@/components/crm/EmailLogList";
import { InquiryForm } from "@/components/crm/InquiryForm";
import { updateInquiryStatus } from "@/lib/actions/crm";
import { formatDate } from "@/lib/utils/format";
import type { InquiryStatus } from "@prisma/client";

const statuses: InquiryStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"];

type InquiryDetailProps = {
  inquiry: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: InquiryStatus;
    remarks: string | null;
    createdAt: Date;
    propertyId: string | null;
    property: { id: string; name: string } | null;
    emails: { id: string; subject: string; body: string; sentAt: Date }[];
  };
};

export function InquiryDetail({ inquiry }: InquiryDetailProps) {
  const router = useRouter();
  const [emailOpen, setEmailOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  async function handleStatusChange(status: InquiryStatus) {
    const result = await updateInquiryStatus(inquiry.id, status);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Status updated");
    router.refresh();
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setEditing(false)}>Cancel Edit</Button>
        <InquiryForm
          inquiryId={inquiry.id}
          defaultValues={{
            name: inquiry.name,
            email: inquiry.email ?? "",
            phone: inquiry.phone ?? "",
            propertyId: inquiry.propertyId ?? "",
            remarks: inquiry.remarks ?? "",
            status: inquiry.status,
          }}
          defaultPropertyName={inquiry.property?.name}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
        {inquiry.email ? (
          <Button onClick={() => setEmailOpen(true)}>Send Email</Button>
        ) : null}
        {statuses.map((s) => (
          <Button
            key={s}
            variant={inquiry.status === s ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange(s)}
          >
            {s}
          </Button>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {inquiry.name}
            <Badge>{inquiry.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
          <div><span className="text-muted-foreground">Email:</span> {inquiry.email ?? "—"}</div>
          <div><span className="text-muted-foreground">Phone:</span> {inquiry.phone ?? "—"}</div>
          <div>
            <span className="text-muted-foreground">Property:</span>{" "}
            {inquiry.property ? (
              <Link href={`/properties/${inquiry.property.id}`} className="hover:underline">
                {inquiry.property.name}
              </Link>
            ) : "—"}
          </div>
          <div><span className="text-muted-foreground">Created:</span> {formatDate(inquiry.createdAt)}</div>
          {inquiry.remarks ? (
            <div className="sm:col-span-2"><span className="text-muted-foreground">Remarks:</span> {inquiry.remarks}</div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Email Log</CardTitle></CardHeader>
        <CardContent><EmailLogList emails={inquiry.emails} /></CardContent>
      </Card>
      {inquiry.email ? (
        <SendEmailDialog
          open={emailOpen}
          onOpenChange={setEmailOpen}
          toEmail={inquiry.email}
          toName={inquiry.name}
          entityType="inquiry"
          entityId={inquiry.id}
        />
      ) : null}
    </div>
  );
}
