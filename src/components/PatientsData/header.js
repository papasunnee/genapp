import React from "react";
import useSWR from "swr";

import { fetcher } from "@/utils/fetcher";
import CardStats from "../Cards/CardStats";
import { useRouter } from "next/router";
import CardProfile from "../Cards/CardProfile";

// components

export default function Header() {
  const router = useRouter();
  const { data: patientsData } = useSWR("/api/patients", fetcher);
  const { data: patientData } = useSWR(
    `/api/patients?id=${router.query.id}`,
    fetcher
  );
  const { data: userData } = useSWR("/api/users", fetcher);
  console.log({ patientData });
  return (
    <>
      {/* Header */}
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full px-4 border">
                <CardProfile />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
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
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
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
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="RESULTS / SALES"
                  statTitle="0"
                  statArrow="down"
                  statPercent="1.10"
                  statPercentColor="text-orange-500"
                  statDescripiron="Since yesterday"
                  statIconName="far fa-chart-bar"
                  statIconColor="bg-pink-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="TESTS"
                  statTitle="0%"
                  statArrow="up"
                  statPercent="12"
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
