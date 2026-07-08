import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { DataTable } from "@/components/shared/DataTable";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type ListingRow = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  propertyType: string | null;
  purpose: string | null;
  bedrooms: number | null;
  squareFootage: number | null;
  askingPrice: number | null;
  monthlyRent: number | null;
  isConverted: boolean;
  convertedPropertyId: string | null;
};

type OwnerListingTableProps = {
  listings: ListingRow[];
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export function OwnerListingTable({
  listings,
  page,
  totalPages,
  searchParams,
}: OwnerListingTableProps) {
  return (
    <DataTable
      columns={[
        {
          header: "Full Name",
          cell: (row) => (
            <Link
              href={`/crm/owner-listings/${row.id}`}
              className={cn(
                "font-medium hover:underline",
                row.isConverted && "text-muted-foreground",
              )}
            >
              {row.fullName}
            </Link>
          ),
        },
        { header: "Phone", cell: (row) => row.phone ?? "-" },
        { header: "Email", cell: (row) => row.email ?? "-" },
        { header: "Type", cell: (row) => row.propertyType ?? "-" },
        {
          header: "Purpose",
          cell: (row) => row.purpose?.replace(/_/g, " ") ?? "-",
        },
        { header: "Bedrooms", cell: (row) => row.bedrooms ?? "-" },
        { header: "Sqft", cell: (row) => row.squareFootage ?? "-" },
        {
          header: "Price/Rent",
          cell: (row) => {
            if (row.askingPrice) return formatCurrency(row.askingPrice);
            if (row.monthlyRent) return formatCurrency(row.monthlyRent);
            return "-";
          },
        },
        {
          header: "Status",
          cell: (row) =>
            row.isConverted ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Converted</Badge>
                {row.convertedPropertyId ? (
                  <ButtonLink
                    variant="link"
                    size="xs"
                    className="h-auto p-0"
                    href={`/properties/${row.convertedPropertyId}`}
                  >
                    View
                  </ButtonLink>
                ) : null}
              </div>
            ) : (
              <Badge variant="outline" className="bg-green-50">Active</Badge>
            ),
        },
        {
          header: "Actions",
          cell: (row) => (
            <ButtonLink variant="ghost" size="xs" href={`/crm/owner-listings/${row.id}`}>
              View
            </ButtonLink>
          ),
        },
      ]}
      data={listings}
      keyExtractor={(row) => row.id}
      rowClassName={(row) => (row.isConverted ? "opacity-60" : undefined)}
      page={page}
      totalPages={totalPages}
      basePath="/crm/owner-listings"
      searchParams={searchParams}
    />
  );
}
