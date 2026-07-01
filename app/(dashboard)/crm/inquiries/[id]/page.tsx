import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { InquiryDetail } from "@/components/crm/InquiryDetail";
import { getInquiry } from "@/lib/actions/crm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiry = await getInquiry(id);
  if (!inquiry) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={inquiry.name} description="Inquiry details" />
      <InquiryDetail inquiry={inquiry} />
    </div>
  );
}
