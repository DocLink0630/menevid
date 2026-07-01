import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type Revision = {
  id: string;
  previousRent: number;
  newRent: number;
  effectiveDate: Date;
  note: string | null;
};

export function RentRevisionHistory({ revisions }: { revisions: Revision[] }) {
  if (revisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No rent revisions.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Previous Rent</TableHead>
          <TableHead>New Rent</TableHead>
          <TableHead>Effective Date</TableHead>
          <TableHead>Note</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {revisions.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{formatCurrency(r.previousRent)}</TableCell>
            <TableCell>{formatCurrency(r.newRent)}</TableCell>
            <TableCell>{formatDate(r.effectiveDate)}</TableCell>
            <TableCell>{r.note ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
