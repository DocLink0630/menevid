import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SummaryCardsProps = {
  summary: {
    totalProperties: number;
    currentlyRented: number;
    available: number;
    temporarilyUnavailable: number;
    listedForSale: number;
    totalActiveLeases: number;
  };
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    { title: "Total Properties", value: summary.totalProperties },
    { title: "Currently Rented", value: summary.currentlyRented },
    { title: "Available", value: summary.available },
    { title: "Temp. Unavailable", value: summary.temporarilyUnavailable },
    { title: "Listed for Sale", value: summary.listedForSale },
    { title: "Active Leases", value: summary.totalActiveLeases },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
