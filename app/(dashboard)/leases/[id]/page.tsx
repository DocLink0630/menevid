import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeaseDetailView } from "@/components/leases/LeaseDetailView";
import { getLease } from "@/lib/actions/leases";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LeaseDetailPage({ params }: Props) {
  const { id } = await params;
  const lease = await getLease(id);
  if (!lease) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Lease — ${lease.tenantName}`}
        description={lease.property.name}
      />
      <LeaseDetailView lease={lease} />
    </div>
  );
}
