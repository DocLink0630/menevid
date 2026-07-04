"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExportReportButtonProps = {
  type: "portfolio" | "renewals" | "overdue" | "activity";
  label?: string;
};

export function ExportReportButton({
  type,
  label = "Download Excel",
}: ExportReportButtonProps) {
  return (
    <Button variant="outline" size="sm" asChild className="gap-1.5">
      <a href={`/api/reports/export?type=${type}`} download>
        <Download className="size-4" />
        {label}
      </a>
    </Button>
  );
}
