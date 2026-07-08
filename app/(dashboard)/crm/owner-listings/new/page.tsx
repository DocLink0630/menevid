import { PageHeader } from "@/components/shared/PageHeader";
import { BackButton } from "@/components/shared/BackButton";
import { OwnerListingForm } from "@/components/crm/OwnerListingForm";

export default function NewOwnerListingPage() {
  return (
    <div className="space-y-6">
      <BackButton href="/crm/owner-listings" label="Back to Listings" />
      <PageHeader title="New Owner Listing" />
      <OwnerListingForm />
    </div>
  );
}
