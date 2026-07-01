import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";

type EmailLog = {
  id: string;
  subject: string;
  body: string;
  sentAt: Date;
};

export function EmailLogList({ emails }: { emails: EmailLog[] }) {
  if (emails.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No emails sent yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Body</TableHead>
          <TableHead>Sent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.map((email) => (
          <TableRow key={email.id}>
            <TableCell>{email.subject}</TableCell>
            <TableCell className="max-w-xs truncate">{email.body}</TableCell>
            <TableCell>{formatDate(email.sentAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
