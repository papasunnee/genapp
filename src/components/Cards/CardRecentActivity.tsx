"use client";

import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import Skeleton from "@/components/ui/Skeleton";

const STATUS_BADGE: Record<string, string> = {
  "Awaiting Payment": "bg-red-50 text-red-700",
  "Awaiting Result": "bg-orange-50 text-orange-700",
  "Test Completed": "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-slate-100 text-slate-500",
};

export default function CardRecentActivity() {
  const { data, isLoading }: any = useSWR("/api/dashboard", fetcher);
  const activity = data?.data?.recentActivity ?? [];

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="px-4 py-3">
        <h6 className="uppercase text-slate-400 mb-1 text-xs font-semibold tracking-wide">
          Latest Orders
        </h6>
        <h2 className="text-slate-800 text-xl font-semibold">Recent Activity</h2>
      </div>
      <div className="px-4 pb-2">
        {isLoading ? (
          <div className="space-y-3 pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : activity.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {activity.map((item: any) => (
              <li key={item.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-clipboard-list text-brand-600 text-sm"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {item.testTitle}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.patientName} &middot; {moment(item.at).fromNow()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                    STATUS_BADGE[item.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 py-6 text-center">No test activity yet.</p>
        )}
      </div>
    </div>
  );
}
