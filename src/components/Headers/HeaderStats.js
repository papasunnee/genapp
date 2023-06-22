import React from "react";
import useSWR from "swr";

import { fetcher } from "@/utils/fetcher";

// components
import CardStats from "../Cards/CardStats";

export default function HeaderStats({ muteStats }) {
  const { data: patientsData } = useSWR("/api/patients", fetcher);
  const { data: userData } = useSWR("/api/users", fetcher);
  const { data: testData } = useSWR(
    "/api/diagnosis?filter=true&status=Test Completed",
    fetcher
  );
  return (
    <>
      {/* Header */}
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full sm:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="PATIENTS"
                  statTitle={patientsData?.data?.length || 0}
                  statArrow="up"
                  statPercent="3.48"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Since last month"
                  statIconName="fas fa-user"
                  statIconColor="bg-red-500"
                />
              </div>
              <div className="w-full sm:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="STAFF / USERS"
                  statTitle={userData?.data?.length || 0}
                  statArrow="down"
                  statPercent="3.48"
                  statPercentColor="text-red-500"
                  statDescripiron="Since last week"
                  statIconName="fas fa-users"
                  statIconColor="bg-orange-500"
                />
              </div>
              <div className="w-full sm:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="RESULTS"
                  statTitle={testData?.data?.length || 0}
                  statArrow="down"
                  statPercent="1.10"
                  statPercentColor="text-orange-500"
                  statDescripiron="Since last week"
                  statIconName="far fa-chart-bar"
                  statIconColor="bg-pink-500"
                />
              </div>
              <div className="w-full sm:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="REVENUE"
                  statTitle={testData?.percentage || 0}
                  statArrow={
                    testData?.percentage && testData?.percentage > 0
                      ? "up"
                      : "down"
                  }
                  statPercent={testData?.percentage || 0}
                  statPercentColor="text-emerald-500"
                  statDescripiron="Since last month"
                  statIconName="fas fa-percent"
                  statIconColor="bg-sky-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
