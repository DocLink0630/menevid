import { PageHeader } from "@/components/shared/PageHeader";
import { OwnerListingForm } from "@/components/crm/OwnerListingForm";

export default function NewOwnerListingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Owner Listing" />
      <OwnerListingForm />
    </div>
  );
}
