import {
  PageHeaderSkeleton,
  TableSkeleton,
  ToolbarSkeleton,
} from "@/components/shared/loading-skeletons";

export default function PropertiesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <ToolbarSkeleton />
      <TableSkeleton rows={10} />
    </div>
  );
}
