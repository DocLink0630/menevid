import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { BackButton } from "@/components/shared/BackButton";
import { LeaseForm } from "@/components/leases/LeaseForm";
import { getLease } from "@/lib/actions/leases";
import { getAvailablePropertiesForLease } from "@/lib/actions/properties";
import { decodePaymentDue } from "@/lib/utils/payment-frequency";

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

  const payment = decodePaymentDue(lease.paymentDueDay);

  return (
    <div className="space-y-6">
      <BackButton href={`/leases/${id}`} label="Back to Lease" />
      <PageHeader title="Edit Lease" description={lease.tenantName} />
      <LeaseForm
        properties={[
          {
            id: lease.property.id,
            name: lease.property.name,
            unitNumber: lease.property.unitNumber,
          },
          ...properties.filter((p) => p.id !== lease.property.id),
        ]}
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
          paymentDueDay: payment.day,
          paymentFrequencyMonths: payment.frequencyMonths,
        }}
      />
    </div>
  );
}
