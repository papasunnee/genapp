"use client";

import { use } from "react";
import { fetcher } from "@/utils/fetcher";
import useSWR from "swr";
import { printAge } from "@/utils/functions";
import moment from "moment";
import Skeleton from "@/components/ui/Skeleton";

export default function TestPrintPage({
  params,
}: {
  params: Promise<{ user: string; id: string }>;
}) {
  const { id, user } = use(params);

  const {
    data: testData,
    error,
    isLoading,
  }: any = useSWR(
    `/api/diagnosis/test?testId=${id}&patientId=${user}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div style={{ width: "450px" }} className="mx-auto mt-16 space-y-3">
        <Skeleton className="h-5 w-64 mx-auto" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-16 text-center text-sm text-red-600">
        Failed to load this report.
      </div>
    );
  }

  const test = testData?.data?.tests?.[0];

  return (
    <div
      style={{ width: "450px" }}
      className="mx-auto mt-16 flex flex-col items-center space-y-4"
    >
      <h2 className="text-md font-semibold mb-2 uppercase tracking-wide">
        Laboratory Test Report
      </h2>
      <table className="text-xs border border-slate-300 w-full p-2">
        <tbody>
          <tr>
            <td>
              <p className="mb-1">NAME</p>
              <hr className="w-1/2 border-slate-300" />
              <p className="font-bold uppercase">
                {testData?.data?.firstname} {testData?.data?.lastname}
              </p>
            </td>
            <td>
              <p className="mb-1">AGE</p>
              <hr className="w-1/2 border-slate-300" />
              <p className="font-bold text-sm">{printAge(testData?.data?.dob)}</p>
            </td>
            <td>
              <p className="mb-1">GENDER</p>
              <hr className="w-1/2 border-slate-300" />
              <p className="font-bold text-sm">{testData?.data?.gender}</p>
            </td>
          </tr>
          <tr>
            <td>
              <p className="mb-1">CLINICAL ADDRESS</p>
              <hr className="w-1/2 border-slate-300" />
              <p className="font-bold">{test?.clinical_address || "N/A"}</p>
            </td>
            <td>
              <p className="mb-1">CLINICAL DIAGNOSIS</p>
              <hr className="w-1/2 border-slate-300" />
              <p className="font-bold text-sm">{test?.clinical_diagnosis || "N/A"}</p>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              <p className="mb-1">SPECIMEN</p>
              <hr className="w-1/2 border-slate-300" />
              <p className="font-bold">{test?.specimen || "N/A"}</p>
            </td>
            <td>
              <p className="mb-1">DATE RECEIVED</p>
              <hr className="w-1/2 border-slate-300" />
              <p className="font-bold text-sm">
                {test?.createdAt ? moment(test.createdAt).format("Do MMM, YYYY") : "N/A"}
              </p>
            </td>
            <td>
              <p className="mb-1">DATE REPORTED</p>
              <hr className="w-1/2 border-slate-300" />
              <p className="font-bold text-sm">
                {test?.status === "Test Completed" && test?.updatedAt
                  ? moment(test.updatedAt).format("Do MMM, YYYY")
                  : "N/A"}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="uppercase text-sm font-semibold mb-2 py-4 w-full text-center">
        {test?.test_title}
      </h2>

      <div className="flex flex-col items-start my-4 space-y-2 w-full">
        <table className="w-full text-xs">
          <tbody>
            <tr className="w-full flex space-y-0 mt-0">
              <td className="text-left flex-grow w-1/2 border border-slate-300 px-2 font-semibold">
                PARAMETER
              </td>
              <td className="flex-grow w-1/2 border border-slate-300 font-semibold">
                VALUE
              </td>
              <td className="flex-grow w-1/2 border border-slate-300 font-semibold">
                UNIT
              </td>
              <td className="flex-grow w-1/2 border border-slate-300 font-semibold">
                REF. RANGE
              </td>
            </tr>
            {testData?.resultArray?.map((item: any, index: number) => {
              if (item.parameter.resultType === "text") {
                return (
                  <tr className="w-full flex flex-col mt-0" key={index}>
                    <td className="text-left border border-slate-300 px-2 font-semibold bg-slate-50">
                      {item.parameter.name}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 whitespace-pre-wrap">
                      {item.parameter.value}
                    </td>
                  </tr>
                );
              }
              return (
                <tr className="w-full flex space-y-0 mt-0" key={index}>
                  <td className="text-left flex-grow w-1/2 border border-slate-300 px-2">
                    {item.parameter.name}
                  </td>
                  <td className="flex-grow w-1/2 border border-slate-300">
                    {item.parameter.value}
                  </td>
                  <td className="flex-grow w-1/2 border border-slate-300">
                    {item.parameter.selectedunit || item.parameter.unit?.[0] || "-"}
                  </td>
                  <td className="flex-grow w-1/2 border border-slate-300">
                    {item.parameter.range || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div>
        <button
          className="print:hidden inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 mb-2 transition-colors"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>
    </div>
  );
}
