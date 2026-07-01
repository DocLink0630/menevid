import { PageHeader } from "@/components/shared/PageHeader";
import { InquiryForm } from "@/components/crm/InquiryForm";

export default function NewInquiryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Inquiry" />
      <InquiryForm />
    </div>
  );
}
