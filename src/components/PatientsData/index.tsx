"use client";

import React, { useState } from "react";
import useSWR from "swr";
import moment from "moment";
import PropTypes from "prop-types";

// components
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import Pagination from "react-js-pagination";
import TableSkeleton from "./TableSkeleton";

type PatientsDataProps = {
  color?: "light" | "dark";
  addButton?: boolean;
};

export default function PatientsData({ color, addButton }: PatientsDataProps) {
  const { data }: any = useSession();
  const { data: patientData, isLoading }: any = useSWR(
    "/api/patients",
    fetcher
  );
  const { data: dateData }: any = useSWR("/api/time", fetcher);
  const resPerPage = 5;
  const [testPage, setTestPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);

  const handlePageChange = (currentPage: number) => {
    setTestPage(currentPage);
    setStartIndex((currentPage - 1) * resPerPage);
    setEndIndex(currentPage * resPerPage);
  };

  const patients = patientData?.data ?? [];

  return (
    <div
      className={
        "relative flex flex-col min-w-0 break-words w-full mb-6 rounded-xl border shadow-sm " +
        (color === "light"
          ? "bg-white border-slate-200"
          : "bg-slate-700 text-white border-slate-600")
      }
    >
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-0 max-w-full flex-grow flex-1">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">
              Patients List ({patients.length})
            </h6>
            <span className="font-normal text-xs md:text-sm text-slate-400">
              Page {patients.length ? testPage : 0} of{" "}
              {Math.ceil(patients.length / resPerPage) || 0}
            </span>
          </div>

          {addButton &&
            [100, 200, 500].includes(data?.user?.role?.weight) && (
              <div>
                <Link
                  href="/admin/patients/newpatient"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white active:bg-emerald-700 text-xs font-semibold uppercase px-3 py-2 rounded-lg outline-none focus:outline-none transition-colors space-x-1"
                  title="Add New Patient"
                >
                  <i className="fas fa-plus"></i>
                  <span className="hidden sm:inline-block">
                    Add New Patient
                  </span>
                </Link>
              </div>
            )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} />
      ) : patients.length > 0 ? (
        <>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th
                    className={
                      "px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-left tracking-wide " +
                      (color === "light"
                        ? "bg-slate-50 text-slate-500 border-slate-100"
                        : "bg-slate-600 text-slate-200 border-slate-500")
                    }
                  >
                    Name
                  </th>
                  <th
                    className={
                      "px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-left tracking-wide " +
                      (color === "light"
                        ? "bg-slate-50 text-slate-500 border-slate-100"
                        : "bg-slate-600 text-slate-200 border-slate-500")
                    }
                  >
                    Tests Taken
                  </th>
                  <th
                    className={
                      "px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-left tracking-wide " +
                      (color === "light"
                        ? "bg-slate-50 text-slate-500 border-slate-100"
                        : "bg-slate-600 text-slate-200 border-slate-500")
                    }
                  >
                    Email
                  </th>
                  <th
                    className={
                      "px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-left tracking-wide " +
                      (color === "light"
                        ? "bg-slate-50 text-slate-500 border-slate-100"
                        : "bg-slate-600 text-slate-200 border-slate-500")
                    }
                  >
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients
                  .slice(startIndex, endIndex)
                  .map((item: any, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                    >
                      <th className="px-6 align-middle text-sm whitespace-nowrap p-3 text-left flex items-center">
                        <div className="hidden h-10 w-10 bg-slate-100 rounded-full md:flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-user text-lg text-slate-400"></i>
                        </div>
                        <div>
                          <Link
                            href={`/admin/patients/${item._id}`}
                            className="hover:underline text-slate-700"
                          >
                            <span className="ml-0 md:ml-3 font-semibold text-slate-700">
                              {item.firstname} {item.lastname}
                            </span>
                          </Link>
                          <span className="ml-0 md:ml-3 font-normal text-xs text-slate-400 block">
                            {moment([
                              dateData?.currentYear,
                              dateData?.currentMonth,
                              dateData?.currentDate,
                            ]).diff(moment(item?.dob), "years")}{" "}
                            years &middot; {item.gender}
                          </span>
                        </div>
                      </th>
                      <td className="px-6 align-middle text-sm whitespace-nowrap p-3 text-slate-600">
                        {item?.tests?.length || "None"}
                      </td>
                      <td className="px-6 align-middle text-sm whitespace-nowrap p-3 text-slate-600">
                        {item?.email}
                      </td>
                      <td className="px-6 align-middle text-sm whitespace-nowrap p-3 text-slate-600">
                        {item?.phone}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center my-5 px-2">
            <Pagination
              activePage={testPage}
              itemsCountPerPage={resPerPage}
              totalItemsCount={patients.length}
              pageRangeDisplayed={5}
              nextPageText={"Next"}
              prevPageText={"Prev"}
              firstPageText={"First"}
              lastPageText={"Last"}
              onChange={handlePageChange}
              itemClass="relative inline-flex items-center border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 focus:z-20"
              activeLinkClass="z-10 inline-flex items-center border border-brand-500 bg-brand-50 text-sm font-medium text-brand-700 focus:z-20"
              activeClass="z-10 inline-flex items-center border border-brand-500 bg-brand-50 text-sm font-medium text-brand-700 focus:z-20"
              disabledClass="cursor-not-allowed"
            />
          </div>
        </>
      ) : (
        <div className="block w-full overflow-x-auto">
          <div className="my-8">
            <p className="text-center text-sm text-slate-500">
              You have no patients record, click on Add New Patient
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

PatientsData.defaultProps = {
  color: "light",
  addButton: false,
};

PatientsData.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
  addButton: PropTypes.bool,
};
