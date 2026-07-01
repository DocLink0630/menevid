import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/shared/ButtonLink";

type ConvertToPortfolioButtonProps = {
  listingId: string;
  isConverted: boolean;
  convertedPropertyId: string | null;
};

export function ConvertToPortfolioButton({
  listingId,
  isConverted,
  convertedPropertyId,
}: ConvertToPortfolioButtonProps) {
  if (isConverted && convertedPropertyId) {
    return (
      <ButtonLink variant="outline" href={`/properties/${convertedPropertyId}`}>
        View Property
      </ButtonLink>
    );
  }

  if (isConverted) {
    return <Button variant="outline" disabled>Converted</Button>;
  }

  return (
    <ButtonLink href={`/properties/new?fromListing=${listingId}`}>
      Add to Portfolio
    </ButtonLink>
  );
}
