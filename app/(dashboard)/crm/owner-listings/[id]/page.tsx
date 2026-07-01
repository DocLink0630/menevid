import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { OwnerListingDetail } from "@/components/crm/OwnerListingDetail";
import { getOwnerListing } from "@/lib/actions/crm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OwnerListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getOwnerListing(id);
  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={listing.fullName} description="Owner listing details" />
      <OwnerListingDetail listing={listing} />
    </div>
  );
}
