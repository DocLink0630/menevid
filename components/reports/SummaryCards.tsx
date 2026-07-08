import {
  Building2,
  DoorOpen,
  FileText,
  KeyRound,
  PauseCircle,
  Tag,
} from "lucide-react";
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
    {
      title: "Total Properties",
      value: summary.totalProperties,
      icon: Building2,
    },
    {
      title: "Currently Rented",
      value: summary.currentlyRented,
      icon: KeyRound,
    },
    { title: "Available", value: summary.available, icon: DoorOpen },
    {
      title: "Temp. Unavailable",
      value: summary.temporarilyUnavailable,
      icon: PauseCircle,
    },
    { title: "Listed for Sale", value: summary.listedForSale, icon: Tag },
    {
      title: "Active Leases",
      value: summary.totalActiveLeases,
      icon: FileText,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="border-l-4 border-l-primary shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
