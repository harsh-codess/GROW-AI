// components/dashboard/recent-activity.tsx
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarClock } from "lucide-react";

export function RecentActivity() {
  return (
    <div className="h-[250px] flex items-center justify-center">
      <EmptyState
        icon={<CalendarClock className="h-10 w-10 text-muted-foreground" />}
        title="No recent activity"
        description="Your marketing activities will appear here"
      />
    </div>
  );
}