import { Suspense } from "react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { LeaseTable } from "@/components/leases/LeaseTable";
import { getLeases } from "@/lib/actions/leases";
import { FileText } from "lucide-react";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function LeasesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { leases, totalPages } = await getLeases({ ...params, page });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leases"
        description="Manage property leases"
        actions={
          <ButtonLink href="/leases/new">New Lease</ButtonLink>
        }
      />
      <Suspense>
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "ACTIVE", label: "Active" },
                { value: "EXPIRED", label: "Expired" },
                { value: "TERMINATED", label: "Terminated" },
              ],
            },
          ]}
        />
      </Suspense>
      {leases.length === 0 ? (
        <EmptyState
          title="No leases"
          description="Create a new lease to get started."
          actionLabel="New Lease"
          actionHref="/leases/new"
          icon={<FileText className="size-10" />}
        />
      ) : (
        <LeaseTable
          leases={leases}
          page={page}
          totalPages={totalPages}
          searchParams={params}
        />
      )}
    </div>
  );
}
