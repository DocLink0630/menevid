import { Suspense } from "react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { PropertyTable } from "@/components/properties/PropertyTable";
import { getProperties } from "@/lib/actions/properties";
import { Building2 } from "lucide-react";

type Props = {
  searchParams: Promise<{
    status?: string;
    type?: string;
    purpose?: string;
    q?: string;
    page?: string;
  }>;
};

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { properties, totalPages } = await getProperties({
    status: params.status,
    type: params.type,
    purpose: params.purpose,
    q: params.q,
    page,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Manage your property portfolio"
        actions={
          <ButtonLink href="/properties/new">Add Property</ButtonLink>
        }
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense>
          <SearchInput placeholder="Search name or unit..." />
        </Suspense>
        <Suspense>
          <FilterBar
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "AVAILABLE", label: "Available" },
                  { value: "RENTED", label: "Rented" },
                  { value: "SOLD", label: "Sold" },
                  {
                    value: "TEMPORARILY_UNAVAILABLE",
                    label: "Temp. Unavailable",
                  },
                ],
              },
              {
                key: "type",
                label: "Type",
                options: [
                  { value: "APARTMENT", label: "Apartment" },
                  { value: "HOUSE", label: "House" },
                  { value: "LAND", label: "Land" },
                  { value: "COMMERCIAL", label: "Commercial" },
                ],
              },
              {
                key: "purpose",
                label: "Purpose",
                options: [
                  { value: "RENT", label: "Rent" },
                  { value: "SALE", label: "Sale" },
                  { value: "RENT_AND_SALE", label: "Rent & Sale" },
                ],
              },
            ]}
          />
        </Suspense>
      </div>
      {properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="Get started by adding your first property."
          actionLabel="Add Property"
          actionHref="/properties/new"
          icon={<Building2 className="size-10" />}
        />
      ) : (
        <PropertyTable
          properties={properties}
          page={page}
          totalPages={totalPages}
          searchParams={params}
        />
      )}
    </div>
  );
}
