import React from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import CardStats from "../Cards/CardStats";

export default function HeaderStats({ muteStats }) {
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

  const stats = [
    {
      key: "patients",
      subtitle: "PATIENTS",
      title: patientsData?.data?.length || 0,
      arrow: "up",
      percent: "3.48",
      percentColor: "text-emerald-500",
      description: "Since last month",
      iconName: "fas fa-user",
      iconColor: "bg-red-500",
    },
    {
      key: "users",
      subtitle: "STAFF / USERS",
      title: userData?.data?.length || 0,
      arrow: "down",
      percent: "3.48",
      percentColor: "text-red-500",
      description: "Since last week",
      iconName: "fas fa-users",
      iconColor: "bg-orange-500",
    },
    {
      key: "results",
      subtitle: "RESULTS",
      title: testData?.data?.length || 0,
      arrow: "down",
      percent: "1.10",
      percentColor: "text-orange-500",
      description: "Since last week",
      iconName: "far fa-chart-bar",
      iconColor: "bg-pink-500",
    },
    {
      key: "revenue",
      subtitle: "REVENUE",
      title: testData?.percentage?.toFixed?.(2) || 0,
      arrow: testData?.percentage && testData.percentage > 0 ? "up" : "down",
      percent: testData?.percentage?.toFixed?.(2) || 0,
      percentColor: "text-emerald-500",
      description: "Since last month",
      iconName: "fas fa-percent",
      iconColor: "bg-sky-500",
    },
  ];

  return (
    <header className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="flex flex-wrap">
          {loading ? (
            <div className="text-white w-full text-center py-10">
              Loading stats...
            </div>
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
                  statIconColor={stat.iconColor}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
