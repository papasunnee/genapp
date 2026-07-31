"use client";

import React, { useState } from "react";
import useSWR from "swr";
import moment from "moment";
import PropTypes from "prop-types";

// components
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import Pagination from "@/components/ui/Pagination";
import TableSkeleton from "./TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

type PatientsDataProps = {
  addButton?: boolean;
};

export default function PatientsData({ addButton }: PatientsDataProps) {
  const { data }: any = useSession();
  const { data: patientData, isLoading }: any = useSWR(
    "/api/patients",
    fetcher
  );
  const { data: dateData }: any = useSWR("/api/time", fetcher);
  const { data: planData }: any = useSWR("/api/organization/plan", fetcher);
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
  const maxPatients = planData?.data?.limits?.maxPatients;
  const patientsAtLimit = typeof maxPatients === "number" && patients.length >= maxPatients;

  return (
    <div className={TABLE_CARD_CLASS}>
      <div className={TABLE_HEADER_CLASS}>
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
            [100, 200, 500].includes(data?.user?.role?.weight) &&
            (patientsAtLimit ? (
              <div
                title={`Your plan is limited to ${maxPatients} patient records`}
                className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold uppercase px-3 py-2 rounded-lg"
              >
                <i className="fas fa-lock"></i>
                <span>Patient limit reached</span>
              </div>
            ) : (
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
            ))}
        </div>
        {patientsAtLimit && (
          <p className="text-xs text-amber-600 mt-2">
            You&apos;ve reached your plan&apos;s {maxPatients}-patient limit. Upgrade to add more.
          </p>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} />
      ) : patients.length > 0 ? (
        <>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className={TABLE_TH_CLASS}>Name</th>
                  <th className={TABLE_TH_CLASS}>Tests Taken</th>
                  <th className={TABLE_TH_CLASS}>Email</th>
                  <th className={TABLE_TH_CLASS}>Phone</th>
                </tr>
              </thead>
              <tbody>
                {patients
                  .slice(startIndex, endIndex)
                  .map((item: any, index: number) => (
                    <tr key={index} className={TABLE_TR_CLASS}>
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
                      <td className={TABLE_TD_CLASS}>
                        {item?.tests?.length || "None"}
                      </td>
                      <td className={TABLE_TD_CLASS}>{item?.email}</td>
                      <td className={TABLE_TD_CLASS}>{item?.phone}</td>
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
              onChange={handlePageChange}
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
  addButton: false,
};

PatientsData.propTypes = {
  addButton: PropTypes.bool,
};
