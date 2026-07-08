import { Suspense } from "react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { OwnerListingTable } from "@/components/crm/OwnerListingTable";
import { getOwnerListings } from "@/lib/actions/crm";
import { Users } from "lucide-react";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OwnerListingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { listings, totalPages } = await getOwnerListings({ ...params, page });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Listings"
        description="Property owners who want Menavid to list their property"
        actions={
          <ButtonLink href="/crm/owner-listings/new">New Listing</ButtonLink>
        }
      />
      <Suspense>
        <FilterBar
          filters={[
            {
              key: "purpose",
              label: "Purpose",
              options: [
                { value: "RENT", label: "Rent" },
                { value: "SALE", label: "Sale" },
                { value: "RENT_AND_SALE", label: "Rent & Sale" },
              ],
            },
            {
              key: "propertyType",
              label: "Type",
              options: [
                { value: "APARTMENT", label: "Apartment" },
                { value: "HOUSE", label: "House" },
                { value: "LAND", label: "Land" },
                { value: "COMMERCIAL", label: "Commercial" },
              ],
            },
            {
              key: "isConverted",
              label: "Converted",
              options: [
                { value: "true", label: "Converted" },
                { value: "false", label: "Active" },
              ],
            },
          ]}
        />
      </Suspense>
      {listings.length === 0 ? (
        <EmptyState
          title="No owner listings"
          description="Add a new owner listing to get started."
          actionLabel="New Listing"
          actionHref="/crm/owner-listings/new"
          icon={<Users className="size-10" />}
        />
      ) : (
        <OwnerListingTable
          listings={listings}
          page={page}
          totalPages={totalPages}
          searchParams={params}
        />
      )}
    </div>
  );
}
