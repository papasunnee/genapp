"use client";

import { fetcher } from "@/utils/fetcher";
import { getAge } from "@/utils/functions";
import React from "react";
import useSWR from "swr";
import Skeleton from "@/components/ui/Skeleton";

export default function Profile({ id }: { id?: string }) {
  const { data: patientData, isLoading }: any = useSWR(
    `/api/patients?id=${id}`,
    fetcher
  );
  const patient = patientData?.data;

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
                {patient?.firstname} {patient?.lastname}
              </h3>
              {patient?.address && (
                <div className="text-sm text-slate-400 mt-1">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {patient.address}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center text-slate-600">
            <i className="fas fa-child mr-3 text-slate-400 w-4"></i>
            {isLoading ? (
              <Skeleton className="h-3 w-24" />
            ) : (
              getAge(patient?.dob)
            )}
          </div>
          <div className="flex items-center text-slate-600">
            <i className="fas fa-envelope mr-3 text-slate-400 w-4"></i>
            {isLoading ? (
              <Skeleton className="h-3 w-36" />
            ) : (
              patient?.email || "-"
            )}
          </div>
          <div className="flex items-center text-slate-600">
            <i className="fas fa-phone mr-3 text-slate-400 w-4"></i>
            {isLoading ? <Skeleton className="h-3 w-28" /> : patient?.phone || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
