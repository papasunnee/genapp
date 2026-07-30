"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import Pagination from "@/components/ui/Pagination";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

export default function PaymentsData() {
  const resPerPage = 5;
  const [testDataList, setTestDataList] = useState<any>([]);
  const { data: testData, isLoading }: any = useSWR("/api/diagnosis", fetcher);

  const [testPage, setTestPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);

  useEffect(() => {
    setTestDataList(testData?.data);
  }, [testData]);

  const handleSelectChange = (e: any) => {
    const { value } = e.target;
    setStartIndex(0);
    setTestPage(1);
    setEndIndex(resPerPage);
    const filtered = testData?.data?.filter((item: any) => {
      if (value == "All") return true;
      return item.status == value;
    });
    setTestDataList(filtered);
  };

  const handlePageChange = (currentPage: number) => {
    setTestPage(currentPage);
    setStartIndex((currentPage - 1) * resPerPage);
    setEndIndex(currentPage * resPerPage);
  };

  return (
    <div className={TABLE_CARD_CLASS}>
      <div className={TABLE_HEADER_CLASS}>
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">
              Payment List ({testDataList?.length || 0})
            </h6>
            <span className="font-normal text-xs md:text-sm text-slate-400">
              Page {testDataList?.length ? testPage : 0} of{" "}
              {Math.ceil((testDataList?.length || 0) / resPerPage) || 0}
            </span>
          </div>
          <select
            onChange={handleSelectChange}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 block p-2.5 transition-colors"
          >
            <option value="All">All Records</option>
            <option value="Test Completed">Test Completed</option>
            <option value="Awaiting Result">Awaiting Result</option>
            <option value="Awaiting Payment">Awaiting Payment</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} />
      ) : testDataList?.length > 0 ? (
        <>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className={TABLE_TH_CLASS}>Test Name</th>
                  <th className={TABLE_TH_CLASS}>Amount</th>
                  <th className={TABLE_TH_CLASS}>Payment Processed By</th>
                  <th className={TABLE_TH_CLASS}>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {testDataList
                  ?.slice(startIndex, endIndex)
                  ?.map((item: any, index: number) => (
                    <tr key={index} className={TABLE_TR_CLASS}>
                      <th className="px-6 align-middle text-sm whitespace-nowrap p-3 text-left">
                        <Link
                          href={`/admin/payments/${item._id}`}
                          className="hover:underline text-slate-700 font-semibold"
                        >
                          {item?.test_title}
                        </Link>
                        <span className="ml-0 font-normal text-xs italic text-slate-400 block">
                          {item?.patient?.firstname} {item?.patient?.lastname}
                        </span>
                        <span className="ml-0 font-normal text-xs italic text-slate-400 block">
                          {item?.status}
                        </span>
                      </th>
                      <td className={TABLE_TD_CLASS}>
                        {item?.payment ? (
                          <div>
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(item?.payment?.amount_paid)}
                            </span>
                            <span className="font-normal text-xs italic text-slate-400 block">
                              Invoice No. {item?.payment?.invoice}
                            </span>
                            <span className="font-normal text-xs text-slate-500 block">
                              {item?.payment?.payment_option?.toString().toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-500">
                            {item?.status}
                          </span>
                        )}
                      </td>
                      <td className={TABLE_TD_CLASS}>
                        {item?.payment ? (
                          <div>
                            <span className="font-semibold text-slate-700">
                              {item?.payment?.user?.firstname}{" "}
                              {item?.payment?.user?.lastname}
                            </span>
                            <span className="font-normal text-xs italic text-slate-400 block">
                              {item?.payment?.user?.role?.name}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-500">
                            {item?.status}
                          </span>
                        )}
                      </td>
                      <td className={TABLE_TD_CLASS}>
                        {item?.payment ? (
                          <div className="flex flex-col">
                            <span>
                              {moment(item?.payment?.createdAt).format("Do MMM, YYYY")}
                            </span>
                            <span className="text-xs text-slate-400">
                              {moment(item?.payment?.createdAt).format("h:mm:ss a")}
                            </span>
                          </div>
                        ) : (
                          <span>{item?.status}</span>
                        )}
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
              totalItemsCount={testDataList?.length}
              onChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="block w-full overflow-x-auto">
          <div className="my-8">
            <p className="text-center text-sm text-slate-500">
              No payment records yet - they will appear here once a test is ordered.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

