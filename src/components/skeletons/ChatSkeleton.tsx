import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SidebarSkeletonProps = {
  className?: string;
};


export default function ChatSkeleton({className} : SidebarSkeletonProps) {
  const messages = Array.from({ length: 8 });

  return (
    <div className={cn("space-y-4 p-4",className)}>
      {messages.map((_, index) => {
        const isUser = index % 2 === 0; // xen kẽ trái/phải
        return (
          <div
            key={index}
            className={`flex ${isUser ? "justify-start" : "justify-end"}`}
          >
            <div className="flex items-start space-x-4 max-w-[80%]">
              {isUser && (
                <Skeleton className="h-10 w-10 rounded-full bg-gray-400" />
              )}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px] bg-gray-400" />
                <Skeleton className="h-4 w-[200px] bg-gray-400" />
              </div>
              {!isUser && (
                <Skeleton className="h-10 w-10 rounded-full bg-gray-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
