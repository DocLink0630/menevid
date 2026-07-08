"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { DataTable } from "@/components/shared/DataTable";
import { PropertyStatusBadge } from "@/components/properties/PropertyStatusBadge";
import { StatusChangeDialog } from "@/components/properties/StatusChangeDialog";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils/format";
import type { PropertyStatus, PropertyType, ListingPurpose } from "@prisma/client";

type PropertyRow = {
  id: string;
  name: string;
  unitNumber: string | null;
  type: PropertyType;
  purpose: ListingPurpose;
  status: PropertyStatus;
  availableFrom: Date | null;
  monthlyRent: number | null;
  salePrice: number | null;
  bedrooms: number | null;
  owners: { id: string; fullName: string; isPrimary: boolean }[];
};

type PropertyTableProps = {
  properties: PropertyRow[];
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export function PropertyTable({
  properties,
  page,
  totalPages,
  searchParams,
}: PropertyTableProps) {
  const [statusDialog, setStatusDialog] = useState<{
    id: string;
    status: PropertyStatus;
  } | null>(null);

  const today = new Date();
  const in60Days = new Date();
  in60Days.setDate(in60Days.getDate() + 60);

  return (
    <>
      <DataTable
        columns={[
          {
            header: "Name",
            cell: (row) => (
              <Link
                href={`/properties/${row.id}`}
                className="font-medium hover:underline"
              >
                {row.name}
              </Link>
            ),
          },
          { header: "Unit No.", cell: (row) => row.unitNumber ?? "-" },
          { header: "Type", cell: (row) => row.type },
          {
            header: "Purpose",
            cell: (row) => row.purpose.replace(/_/g, " "),
          },
          {
            header: "Status",
            cell: (row) => <PropertyStatusBadge status={row.status} />,
          },
          {
            header: "Available From",
            cell: (row) => {
              if (!row.availableFrom) return "-";
              const days = daysUntil(row.availableFrom);
              if (days > 0 && days <= 60) {
                return (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800">
                    Available in {days} days
                  </Badge>
                );
              }
              return formatDate(row.availableFrom);
            },
          },
          {
            header: "Rent/Sale Price",
            cell: (row) => {
              if (row.monthlyRent) return formatCurrency(row.monthlyRent);
              if (row.salePrice) return formatCurrency(row.salePrice);
              return "-";
            },
          },
          {
            header: "Bedrooms",
            cell: (row) => row.bedrooms ?? "-",
          },
          {
            header: "Primary Owner",
            cell: (row) =>
              row.owners.find((o) => o.isPrimary)?.fullName ??
              row.owners[0]?.fullName ??
              "-",
          },
          {
            header: "Actions",
            cell: (row) => (
              <div className="flex gap-1">
                <ButtonLink variant="ghost" size="xs" href={`/properties/${row.id}`}>
                  View
                </ButtonLink>
                <ButtonLink variant="ghost" size="xs" href={`/properties/${row.id}/edit`}>
                  Edit
                </ButtonLink>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    setStatusDialog({ id: row.id, status: row.status })
                  }
                >
                  Status
                </Button>
              </div>
            ),
          },
        ]}
        data={properties}
        keyExtractor={(row) => row.id}
        rowClassName={(row) => {
          if (
            row.availableFrom &&
            new Date(row.availableFrom) <= in60Days &&
            new Date(row.availableFrom) >= today
          ) {
            return "border-l-4 border-l-amber-400";
          }
          return undefined;
        }}
        page={page}
        totalPages={totalPages}
        basePath="/properties"
        searchParams={searchParams}
      />
      {statusDialog ? (
        <StatusChangeDialog
          propertyId={statusDialog.id}
          currentStatus={statusDialog.status}
          open={!!statusDialog}
          onOpenChange={(open) => !open && setStatusDialog(null)}
        />
      ) : null}
    </>
  );
}
