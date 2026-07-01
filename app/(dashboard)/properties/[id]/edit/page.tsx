import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { getProperty } from "@/lib/actions/properties";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const toDateInput = (date?: Date | null) =>
    date ? new Date(date).toISOString().split("T")[0] : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Property" description={property.name} />
      <PropertyForm
        propertyId={id}
        defaultValues={{
          name: property.name,
          unitNumber: property.unitNumber ?? "",
          type: property.type,
          purpose: property.purpose,
          squareFootage: property.squareFootage ?? undefined,
          bedrooms: property.bedrooms ?? undefined,
          furnishing: property.furnishing ?? undefined,
          monthlyRent: property.monthlyRent ?? undefined,
          salePrice: property.salePrice ?? undefined,
          status: property.status,
          temporaryUnavailableUntil: toDateInput(
            property.temporaryUnavailableUntil,
          ),
          availableFrom: toDateInput(property.availableFrom),
          notes: property.notes ?? "",
        }}
        defaultOwners={property.owners.map((o) => ({
          ownerId: o.ownerId,
          fullName: o.fullName,
          isPrimary: o.isPrimary,
        }))}
      />
    </div>
  );
}
