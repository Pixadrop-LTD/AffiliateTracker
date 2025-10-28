import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @Description Skeleton loading state for entry list that mirrors the actual UI structure.
 * @Return {JSX.Element} The skeleton entry card.
 */
export const EntrySkeleton = () => (
    <Card className="overflow-hidden border border-secondary-200 bg-secondary-50/10 transition-all hover:border-primary-300 hover:shadow-md">
        <CardContent className="p-4">
            {/* Header - status and date */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex flex-1 items-center">
                    {/* Icon placeholder */}
                    <div className="mr-2 rounded-lg bg-primary-100/20 p-2">
                        <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    {/* Status badge */}
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                {/* Date */}
                <div className="flex items-center">
                    <Skeleton className="h-3 w-12" />
                </div>
            </div>

            {/* Financial Metrics */}
            <div className="mb-3 flex justify-between rounded-lg bg-neutral-100/50 p-3">
                <div className="flex-1 pr-2">
                    <Skeleton className="mb-1 h-3 w-10" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex-1">
                    <Skeleton className="mb-1 h-3 w-12" />
                    <Skeleton className="h-4 w-18" />
                </div>
                <div className="flex-1">
                    <Skeleton className="mb-1 h-3 w-10" />
                    <Skeleton className="h-4 w-14" />
                </div>
            </div>

            {/* ROI and notes */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-3 w-32" />
            </div>
        </CardContent>
    </Card>
);

/**
 * @Description Multiple entry skeletons for loading state.
 * @Params {number} count - Number of skeleton entries to render.
 * @Return {JSX.Element} Multiple skeleton cards.
 */
export const EntriesListSkeleton = ({ count = 8 }: { count?: number }) => (
    <div className="space-y-3 py-8 pb-28">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <EntrySkeleton />
            </div>
        ))}
    </div>
);
