import { PageHeader } from "@/components/shared/PageHeader";
import { BackButton } from "@/components/shared/BackButton";
import { LeaseForm } from "@/components/leases/LeaseForm";
import { getAvailablePropertiesForLease } from "@/lib/actions/properties";

export default async function NewLeasePage() {
  const properties = await getAvailablePropertiesForLease();

  return (
    <div className="space-y-6">
      <BackButton href="/leases" label="Back to Leases" />
      <PageHeader title="New Lease" description="Create a new lease agreement" />
      <LeaseForm properties={properties} />
    </div>
  );
}
