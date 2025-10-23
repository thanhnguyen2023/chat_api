import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SidebarSkeletonProps = {
  className?: string;
  count?: number;
};

export default function SidebarSkeleton({
  className,
  count = 1,
}: SidebarSkeletonProps) {
  const elements = Array.from({ length: count }, (_, i) => {
    return (
      <div className="p-2 mb-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full bg-gray-400" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] bg-gray-400" />
            <Skeleton className="h-4 w-[200px] bg-gray-400 " />
          </div>
        </div>
      </div>
    );
  });
  return (
    <>
      <div className={cn(className)}>{elements}</div>
    </>
  );
}
