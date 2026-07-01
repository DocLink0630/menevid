import { Badge } from "@/components/ui/badge";
import type { PropertyStatus } from "@prisma/client";

const statusConfig: Record<
  PropertyStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  RENTED: {
    label: "Rented",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  SOLD: {
    label: "Sold",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  TEMPORARILY_UNAVAILABLE: {
    label: "Temp. Unavailable",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
