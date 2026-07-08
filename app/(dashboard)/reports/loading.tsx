import {
  CardBlockSkeleton,
  PageHeaderSkeleton,
  SummaryGridSkeleton,
  TableSkeleton,
} from "@/components/shared/loading-skeletons";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardBlockSkeleton rows={1} />
      <SummaryGridSkeleton count={6} />
      <TableSkeleton rows={5} />
      <TableSkeleton rows={5} />
      <TableSkeleton rows={6} />
    </div>
  );
}
