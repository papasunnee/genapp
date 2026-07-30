"use client";

import React from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import CardStats from "../Cards/CardStats";
import CardStatsSkeleton from "../Cards/CardStatsSkeleton";

export default function HeaderStats({ muteStats }: { muteStats?: any }) {
  const { data: patientsData, isLoading: patientsLoading } = useSWR(
    "/api/patients",
    fetcher
  );
  const { data: userData, isLoading: usersLoading } = useSWR(
    "/api/users",
    fetcher
  );
  const { data: testData, isLoading: testLoading } = useSWR(
    "/api/diagnosis?filter=true&status=Test Completed",
    fetcher
  );

  const loading = patientsLoading || usersLoading || testLoading;

  const revenueUp = !!testData?.percentage && testData.percentage > 0;

  const stats = [
    {
      key: "patients",
      subtitle: "PATIENTS",
      title: patientsData?.data?.length || 0,
      arrow: "up",
      percent: "3.48",
      percentColor: "text-emerald-600",
      description: "Since last month",
      iconName: "fas fa-user",
    },
    {
      key: "users",
      subtitle: "STAFF / USERS",
      title: userData?.data?.length || 0,
      arrow: "down",
      percent: "3.48",
      percentColor: "text-red-600",
      description: "Since last week",
      iconName: "fas fa-users",
    },
    {
      key: "results",
      subtitle: "RESULTS",
      title: testData?.data?.length || 0,
      arrow: "down",
      percent: "1.10",
      percentColor: "text-red-600",
      description: "Since last week",
      iconName: "far fa-chart-bar",
    },
    {
      key: "revenue",
      subtitle: "REVENUE",
      title: testData?.percentage?.toFixed?.(2) || 0,
      arrow: revenueUp ? "up" : "down",
      percent: testData?.percentage?.toFixed?.(2) || 0,
      percentColor: revenueUp ? "text-emerald-600" : "text-red-600",
      description: "Since last month",
      iconName: "fas fa-percent",
    },
  ];

  return (
    <header className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-full sm:w-6/12 xl:w-3/12 px-4 mb-6 xl:mb-0"
              >
                <CardStatsSkeleton />
              </div>
            ))
          ) : (
            stats.map((stat) => (
              <div
                key={stat.key}
                className="w-full sm:w-6/12 xl:w-3/12 px-4 mb-6 xl:mb-0"
              >
                <CardStats
                  statSubtitle={stat.subtitle}
                  statTitle={stat.title}
                  statArrow={stat.arrow}
                  statPercent={stat.percent}
                  statPercentColor={stat.percentColor}
                  statDescripiron={stat.description}
                  statIconName={stat.iconName}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
