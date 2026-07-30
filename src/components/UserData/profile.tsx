"use client";

import { fetcher } from "@/utils/fetcher";
import { getAge } from "@/utils/functions";
import { useSession } from "next-auth/react";
import React from "react";
import useSWR from "swr";
import Skeleton from "@/components/ui/Skeleton";

export default function Profile() {
  const { data: sessionData }: any = useSession();
  const { data: userData, isLoading }: any = useSWR(
    `/api/users?id=${sessionData?.user?._id}`,
    fetcher
  );
  const user = userData?.data;

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="px-6 py-8">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-brand-50 flex items-center justify-center">
            <i className="fas fa-user text-3xl text-brand-500"></i>
          </div>
        </div>
        <div className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-slate-800">
                {user?.firstname} {user?.lastname}
              </h3>
              <div className="text-sm text-slate-400 mt-1">
                <i className="fas fa-user-shield mr-1"></i>
                {user?.role?.name}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 space-y-3 text-sm max-w-sm mx-auto">
          <div className="flex items-center text-slate-600">
            <i className="fas fa-child mr-3 text-slate-400 w-4"></i>
            {isLoading ? (
              <Skeleton className="h-3 w-32" />
            ) : (
              `${getAge(user?.dob)} · ${user?.gender || "-"}`
            )}
          </div>
          <div className="flex items-center text-slate-600">
            <i className="fas fa-envelope mr-3 text-slate-400 w-4"></i>
            {isLoading ? <Skeleton className="h-3 w-36" /> : user?.email || "-"}
          </div>
          <div className="flex items-center text-slate-600">
            <i className="fas fa-phone mr-3 text-slate-400 w-4"></i>
            {isLoading ? <Skeleton className="h-3 w-28" /> : user?.phone || "-"}
          </div>
        </div>

        {user?.description && (
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm leading-relaxed text-slate-600 max-w-md mx-auto">
              {user.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
