import {
  PageHeaderSkeleton,
  ReminderListSkeleton,
  TabsSkeleton,
} from "@/components/shared/loading-skeletons";

export default function RemindersLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TabsSkeleton />
      <ReminderListSkeleton count={5} />
    </div>
  );
}
