import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";

type Activity = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userName: string;
  createdAt: Date;
};

function entityLink(entity: string, entityId: string | null) {
  if (!entityId) return null;
  const routes: Record<string, string> = {
    Property: `/properties/${entityId}`,
    Lease: `/leases/${entityId}`,
    Inquiry: `/crm/inquiries/${entityId}`,
    OwnerListing: `/crm/owner-listings/${entityId}`,
    RentPayment: `/leases/${entityId}`,
  };
  return routes[entity] ?? null;
}

export function ActivityLogTable({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Entity ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((a) => {
          const href = entityLink(a.entity, a.entityId);
          return (
            <TableRow key={a.id}>
              <TableCell>{a.action.replace(/_/g, " ")}</TableCell>
              <TableCell>{a.entity}</TableCell>
              <TableCell>
                {href && a.entityId ? (
                  <Link href={href} className="hover:underline font-mono text-xs">
                    {a.entityId.slice(0, 8)}...
                  </Link>
                ) : (
                  a.entityId ?? "—"
                )}
              </TableCell>
              <TableCell>{a.userName}</TableCell>
              <TableCell>{formatDate(a.createdAt)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
