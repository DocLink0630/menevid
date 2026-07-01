import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeaseForm } from "@/components/leases/LeaseForm";
import { getLease } from "@/lib/actions/leases";
import { getAvailablePropertiesForLease } from "@/lib/actions/properties";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditLeasePage({ params }: Props) {
  const { id } = await params;
  const [lease, properties] = await Promise.all([
    getLease(id),
    getAvailablePropertiesForLease(),
  ]);
  if (!lease) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Lease" description={lease.tenantName} />
      <LeaseForm
        properties={properties}
        leaseId={id}
        defaultValues={{
          propertyId: lease.propertyId,
          tenantName: lease.tenantName,
          tenantPhone: lease.tenantPhone ?? "",
          tenantEmail: lease.tenantEmail ?? "",
          tenantNic: lease.tenantNic ?? "",
          startDate: lease.startDate.toISOString().split("T")[0],
          endDate: lease.endDate.toISOString().split("T")[0],
          rentAmount: lease.rentAmount,
          depositAmount: lease.depositAmount ?? undefined,
          paymentDueDay: lease.paymentDueDay,
        }}
      />
    </div>
  );
}
