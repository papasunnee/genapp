import React, { useEffect, useState } from "react";
import { fetcher } from "@/utils/fetcher";
import { useRouter } from "next/router";
import useSWR from "swr";
import { printAge } from "@/utils/functions";

const TestId = () => {
  const router = useRouter();

  const {
    data: testData,
    error,
    isLoading,
  } = useSWR(
    `/api/diagnosis/test?testId=${router.query?.id}&patientId=${router.query?.user}`,
    fetcher
  );

  if (error || isLoading) return "Loading...";

  return (
    <div
      style={{ width: "450px" }}
      className="mx-auto mt-16 flex flex-col items-center space-y-4"
    >
      <h2 className="text-md font-semibold mb-2">LABORATORY TEST REPORT</h2>
      <table className="text-xs border w-full p-2">
        <tr>
          <td>
            <p className="mb-1">NAME</p>
            <hr className="w-1/2" />
            <p className="font-bold uppercase">
              {testData?.data?.firstname} {testData?.data?.lastname}
            </p>
          </td>
          <td>
            <p className="mb-1">AGE</p>
            <hr className="w-1/2" />
            <p className="font-bold text-sm">{printAge(testData?.data?.dob)}</p>
          </td>
          <td>
            <p className="mb-1">GENDER</p>
            <hr className="w-1/2" />
            <p className="font-bold text-sm">{testData?.data?.gender}</p>
          </td>
        </tr>
        <tr>
          <td>
            <p className="mb-1">CLINICAL ADDRESS</p>
            <hr className="w-1/2" />
            <p className="font-bold">
              {testData?.data?.tests[0]?.clinical_address || "N/A"}
            </p>
          </td>
          <td>
            <p className="mb-1">CLINICAL DIAGNOSIS</p>
            <hr className="w-1/2" />
            <p className="font-bold text-sm">
              {testData?.data?.tests[0]?.clinical_diagnosis || "N/A"}
            </p>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>
            <p className="mb-1">SPECIMEN</p>
            <hr className="w-1/2" />
            <p className="font-bold">
              {testData?.data?.tests[0]?.specimen || "N/A"}
            </p>
          </td>
          <td>
            <p className="mb-1">DATE RECEIVED</p>
            <hr className="w-1/2" />
            <p className="font-bold text-sm">
              {testData?.data?.tests[0]?.clinical_diagnosis || "N/A"}
            </p>
          </td>
          <td>
            <p className="mb-1">DATE REPORTED</p>
            <hr className="w-1/2" />
            <p className="font-bold text-sm">
              {testData?.data?.tests[0]?.clinical_diagnosis || "N/A"}
            </p>
          </td>
        </tr>
      </table>

      <h2 className="uppercase text-sm font-semibold mb-2 py-4 w-full text-center">
        {testData?.data?.tests[0]?.test_title}
      </h2>

      <div className="flex flex-col items-start my-4 space-y-2 w-full">
        <table className="w-full text-xs">
          <tr className="w-full flex space-y-0 mt-0">
            <td className="text-left flex-grow w-1/2 border px-2 font-semibold">
              PARAMETER
            </td>
            <td className="flex-grow w-1/2 border font-semibold">VALUE</td>
            <td className="flex-grow w-1/2 border font-semibold">UNIT</td>
            <td className="flex-grow w-1/2 border font-semibold">REF. RANGE</td>
          </tr>
          {testData?.resultArray?.map((item) => {
            return (
              <tr className="w-full flex space-y-0 mt-0">
                <td className="text-left flex-grow w-1/2 border px-2">
                  {item.parameter.name}
                </td>
                <td className="flex-grow w-1/2 border">
                  {item.parameter.value}
                </td>
                <td className="flex-grow w-1/2 border">mg/dl</td>
                <td className="flex-grow w-1/2 border">0.1 - 1.0</td>
              </tr>
            );
          })}
        </table>
      </div>
      <div>
        <button
          className="print:hidden text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default TestId;
