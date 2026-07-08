import { PageHeader } from "@/components/shared/PageHeader";
import { BackButton } from "@/components/shared/BackButton";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { getOwnerListingForConvert } from "@/lib/actions/properties";

type Props = {
  searchParams: Promise<{ fromListing?: string }>;
};

export default async function NewPropertyPage({ searchParams }: Props) {
  const params = await searchParams;
  let defaultValues = {};
  let fromListingId: string | undefined;

  if (params.fromListing) {
    const listing = await getOwnerListingForConvert(params.fromListing);
    if (listing && !listing.isConverted) {
      fromListingId = listing.id;
      defaultValues = {
        name: listing.propertyName ?? "",
        unitNumber: listing.unitNumber ?? "",
        type: listing.propertyType ?? "APARTMENT",
        purpose: listing.purpose ?? "RENT",
        bedrooms: listing.bedrooms ?? undefined,
        squareFootage: listing.squareFootage ?? undefined,
        monthlyRent: listing.monthlyRent ?? undefined,
        salePrice: listing.askingPrice ?? undefined,
        notes: listing.remarks ?? "",
      };
    }
  }

  return (
    <div className="space-y-6">
      <BackButton href="/properties" label="Back to Properties" />
      <PageHeader
        title="New Property"
        description={
          fromListingId
            ? "Converting owner listing to portfolio property"
            : "Add a new property to the portfolio"
        }
      />
      <PropertyForm
        defaultValues={defaultValues}
        fromListingId={fromListingId}
      />
    </div>
  );
}
