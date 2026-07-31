"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import Skeleton from "@/components/ui/Skeleton";

export default function CardPendingActions() {
  const { data, isLoading }: any = useSWR("/api/dashboard", fetcher);
  const pending = data?.data?.pendingActions;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="px-4 py-3">
        <h6 className="uppercase text-slate-400 mb-1 text-xs font-semibold tracking-wide">
          Needs Attention
        </h6>
        <h2 className="text-slate-800 text-xl font-semibold">Pending Actions</h2>
      </div>
      <div className="p-4 pt-0 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </>
        ) : (
          <>
            <Link
              href="/admin/payments"
              className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-money-check-alt text-red-600"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Awaiting Payment</p>
                  <p className="text-xs text-slate-500">Tests waiting to be paid for</p>
                </div>
              </div>
              <span className="text-xl font-bold text-red-600">
                {pending?.awaitingPayment ?? 0}
              </span>
            </Link>
            <Link
              href="/admin/results"
              className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-vial text-orange-600"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Awaiting Result</p>
                  <p className="text-xs text-slate-500">Tests waiting on lab results</p>
                </div>
              </div>
              <span className="text-xl font-bold text-orange-600">
                {pending?.awaitingResult ?? 0}
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
