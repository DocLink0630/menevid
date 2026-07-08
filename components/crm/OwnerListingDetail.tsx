"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendEmailDialog } from "@/components/crm/SendEmailDialog";
import { EmailLogList } from "@/components/crm/EmailLogList";
import { ConvertToPortfolioButton } from "@/components/crm/ConvertToPortfolioButton";
import { formatCurrency } from "@/lib/utils/format";

type OwnerListingDetailProps = {
  listing: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    propertyName: string | null;
    propertyType: string | null;
    purpose: string | null;
    bedrooms: number | null;
    squareFootage: number | null;
    unitNumber: string | null;
    askingPrice: number | null;
    monthlyRent: number | null;
    isConverted: boolean;
    convertedPropertyId: string | null;
    remarks: string | null;
    emails: { id: string; subject: string; body: string; sentAt: Date }[];
  };
};

export function OwnerListingDetail({ listing }: OwnerListingDetailProps) {
  const [emailOpen, setEmailOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {listing.email ? (
          <Button onClick={() => setEmailOpen(true)}>Send Email</Button>
        ) : null}
        <ConvertToPortfolioButton
          listingId={listing.id}
          isConverted={listing.isConverted}
          convertedPropertyId={listing.convertedPropertyId}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {listing.fullName}
            {listing.isConverted ? <Badge variant="outline">Converted</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
          <div><span className="text-muted-foreground">Phone:</span> {listing.phone ?? "-"}</div>
          <div><span className="text-muted-foreground">Email:</span> {listing.email ?? "-"}</div>
          <div><span className="text-muted-foreground">Property:</span> {listing.propertyName ?? "-"}</div>
          <div><span className="text-muted-foreground">Type:</span> {listing.propertyType ?? "-"}</div>
          <div><span className="text-muted-foreground">Purpose:</span> {listing.purpose?.replace(/_/g, " ") ?? "-"}</div>
          <div><span className="text-muted-foreground">Bedrooms:</span> {listing.bedrooms ?? "-"}</div>
          <div><span className="text-muted-foreground">Sqft:</span> {listing.squareFootage ?? "-"}</div>
          <div><span className="text-muted-foreground">Unit:</span> {listing.unitNumber ?? "-"}</div>
          <div><span className="text-muted-foreground">Asking Price:</span> {formatCurrency(listing.askingPrice)}</div>
          <div><span className="text-muted-foreground">Monthly Rent:</span> {formatCurrency(listing.monthlyRent)}</div>
          {listing.remarks ? (
            <div className="sm:col-span-2"><span className="text-muted-foreground">Remarks:</span> {listing.remarks}</div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Email Log</CardTitle></CardHeader>
        <CardContent><EmailLogList emails={listing.emails} /></CardContent>
      </Card>
      {listing.email ? (
        <SendEmailDialog
          open={emailOpen}
          onOpenChange={setEmailOpen}
          toEmail={listing.email}
          toName={listing.fullName}
          entityType="ownerListing"
          entityId={listing.id}
        />
      ) : null}
    </div>
  );
}
