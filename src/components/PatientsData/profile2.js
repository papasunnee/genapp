import { fetcher } from "@/utils/fetcher";
import { getAge } from "@/utils/functions";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";

// components

export default function Profile2() {
  const router = useRouter();
  const { data: patientData } = useSWR(
    `/api/patients?id=${router?.query?.id}`,
    fetcher
  );
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mt-16">
        <div className="px-6">
          <div className="flex flex-wrap justify-center">
            <div className="w-full px-4 flex justify-center">
              <div className="relative">
                <img
                  alt="..."
                  src="/img/team-2-800x800.jpg"
                  className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                />
              </div>
            </div>
          </div>
          <div className="text-center mt-24">
            <h3 className="text-xl font-semibold leading-normal mb-2 text-slate-700 flex items-center justify-center">
              {patientData ? (
                patientData.data?.firstname + " " + patientData?.data?.lastname
              ) : (
                <div className="shadow animate-pulse h-3 bg-gray-300 rounded-full dark:bg-gray-700 w-32"></div>
              )}
            </h3>
            <div className="text-sm leading-normal mt-0 mb-2 text-slate-400 font-bold">
              <i className="fas fa-map-marker-alt mr-2 text-lg text-slate-400"></i>{" "}
              {patientData?.data?.address}
            </div>
            <div className="mb-2 text-slate-600 mt-10 flex justify-center items-center">
              <i className="fas fa-child mr-2 text-lg text-slate-400"></i>
              {getAge(patientData?.data?.dob)}
            </div>
            <div className="mb-2 text-slate-600">
              <i className="fas fa-envelope mr-2 text-lg text-slate-400"></i>
              {patientData?.data?.email}
            </div>
          </div>
          <div className="mt-10 py-10 border-t border-slate-200 text-center">
            <div className="flex flex-wrap justify-center">
              <div className="w-full lg:w-9/12 px-4">
                <p className="mb-4 text-lg leading-relaxed text-slate-700">
                  {patientData?.data?.description}
                </p>
                {/* <a
                  href="#pablo"
                  className="font-normal text-sky-500"
                  onClick={(e) => e.preventDefault()}
                >
                  Show more
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
