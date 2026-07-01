import { type ReactNode } from "react";
import { ButtonLink } from "@/components/shared/ButtonLink";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  rowClassName?: (row: T) => string | undefined;
  page?: number;
  totalPages?: number;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
};

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  rowClassName,
  page,
  totalPages,
  basePath,
  searchParams = {},
}: DataTableProps<T>) {
  function buildPageUrl(targetPage: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.header} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className={rowClassName?.(row)}
              >
                {columns.map((col) => (
                  <TableCell key={col.header} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {page && totalPages && totalPages > 1 && basePath ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <ButtonLink
                variant="outline"
                size="sm"
                href={buildPageUrl(page - 1)}
              >
                Previous
              </ButtonLink>
            ) : null}
            {page < totalPages ? (
              <ButtonLink
                variant="outline"
                size="sm"
                href={buildPageUrl(page + 1)}
              >
                Next
              </ButtonLink>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
