import { PageHeader } from "@/components/shared/PageHeader";
import { BackButton } from "@/components/shared/BackButton";
import { InquiryForm } from "@/components/crm/InquiryForm";

export default function NewInquiryPage() {
  return (
    <div className="space-y-6">
      <BackButton href="/crm/inquiries" label="Back to Inquiries" />
      <PageHeader title="New Inquiry" />
      <InquiryForm />
    </div>
  );
}
