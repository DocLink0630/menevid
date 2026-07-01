import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { PropertyDetailView } from "@/components/properties/PropertyDetailView";
import { getProperty } from "@/lib/actions/properties";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={property.name} description="Property details" />
      <PropertyDetailView property={property} />
    </div>
  );
}
