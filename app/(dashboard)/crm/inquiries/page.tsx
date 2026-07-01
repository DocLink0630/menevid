import { Suspense } from "react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { InquiryTable } from "@/components/crm/InquiryTable";
import { getInquiries } from "@/lib/actions/crm";
import { MessageSquare } from "lucide-react";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function InquiriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { inquiries, totalPages } = await getInquiries({ ...params, page });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries"
        description="Potential buyers and tenants"
        actions={
          <ButtonLink href="/crm/inquiries/new">New Inquiry</ButtonLink>
        }
      />
      <Suspense>
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "NEW", label: "New" },
                { value: "CONTACTED", label: "Contacted" },
                { value: "QUALIFIED", label: "Qualified" },
                { value: "CLOSED", label: "Closed" },
              ],
            },
          ]}
        />
      </Suspense>
      {inquiries.length === 0 ? (
        <EmptyState
          title="No inquiries"
          description="Add a new inquiry to get started."
          actionLabel="New Inquiry"
          actionHref="/crm/inquiries/new"
          icon={<MessageSquare className="size-10" />}
        />
      ) : (
        <InquiryTable
          inquiries={inquiries}
          page={page}
          totalPages={totalPages}
          searchParams={params}
        />
      )}
    </div>
  );
}
