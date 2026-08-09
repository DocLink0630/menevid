import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { BackButton } from "@/components/shared/BackButton";
import { OwnerListingForm } from "@/components/crm/OwnerListingForm";
import { getOwnerListing } from "@/lib/actions/crm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditOwnerListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await getOwnerListing(id);
  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <BackButton href={`/crm/owner-listings/${id}`} label="Back to Listing" />
      <PageHeader title="Edit Owner Listing" description={listing.fullName} />
      <OwnerListingForm
        listingId={id}
        defaultValues={{
          fullName: listing.fullName,
          phone: listing.phone ?? "",
          email: listing.email ?? "",
          propertyName: listing.propertyName ?? "",
          propertyType: listing.propertyType ?? undefined,
          purpose: listing.purpose ?? undefined,
          bedrooms: listing.bedrooms ?? undefined,
          squareFootage: listing.squareFootage ?? undefined,
          unitNumber: listing.unitNumber ?? "",
          askingPrice: listing.askingPrice ?? undefined,
          monthlyRent: listing.monthlyRent ?? undefined,
          currency: listing.currency,
          remarks: listing.remarks ?? "",
        }}
      />
    </div>
  );
}
