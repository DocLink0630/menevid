import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { BackButton } from "@/components/shared/BackButton";
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
      <BackButton href="/crm/inquiries" label="Back to Inquiries" />
      <PageHeader title={inquiry.name} description="Inquiry details" />
      <InquiryDetail inquiry={inquiry} />
    </div>
  );
}
