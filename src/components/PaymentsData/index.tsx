"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import PropTypes from "prop-types";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import Pagination from "react-js-pagination";

// components

type PaymentsDataProps = {
  color?: "light" | "dark";
  addButton?: boolean;
};

export default function PaymentsData({ color, addButton }: PaymentsDataProps) {
  const resPerPage = 5;
  const [testDataList, setTestDataList] = useState<any>([]);
  const { data: testData }: any = useSWR("/api/diagnosis", fetcher);

  console.log({ testData });

  const [testPage, setTestPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);

  useEffect(() => {
    setTestDataList(testData?.data);
  }, [testData]);
  const handleSelectChange = async (e: any) => {
    const { value, name } = e.target;
    setStartIndex(0);
    setTestPage(1);
    setEndIndex(resPerPage);
    try {
      const filtered = testData?.data?.filter((item: any) => {
        if (value == "All") return true;
        return item.status == value;
      });
      setTestDataList(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (currentPage: number) => {
    setTestPage(currentPage);
    setStartIndex((currentPage - 1) * resPerPage);
    setEndIndex(currentPage * resPerPage);
  };
  return (
    <>
      <div
        className={
          "relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " +
          (color === "light" ? "bg-white" : "bg-slate-700 text-white")
        }
      >
        <div className="rounded-t mb-0 px-4 py-6 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h6 className="text-slate-700 text-md md:text-lg font-semibold">
                Payment List ({testDataList?.length})<br />
                <span className="font-thin text-xs md:text-sm">
                  Page {testData ? testPage : 0} of{" "}
                  {Math.ceil((testDataList?.length || 0) / resPerPage) || 0}
                </span>
              </h6>
            </div>
            <form>
              <select
                onChange={handleSelectChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="All">All Records</option>
                <option value="Test Completed">Test Completed</option>
                <option value="Awaiting Result">Awaiting Result</option>
                <option value="Awaiting Payment">Awaiting Payment</option>
              </select>
            </form>
          </div>
        </div>
        {testDataList?.length > 0 ? (
          <>
            <div className="block w-full overflow-x-auto">
              {/* Projects table */}
              <table className="items-center w-full bg-transparent border-collapse">
                <thead>
                  <tr>
                    <th
                      className={
                        "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                        (color === "light"
                          ? "bg-slate-50 text-slate-500 border-slate-100"
                          : "bg-slate-600 text-slate-200 border-slate-500")
                      }
                    >
                      TEST NAME
                    </th>
                    <th
                      className={
                        "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                        (color === "light"
                          ? "bg-slate-50 text-slate-500 border-slate-100"
                          : "bg-slate-600 text-slate-200 border-slate-500")
                      }
                    >
                      Amount
                    </th>
                    <th
                      className={
                        "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                        (color === "light"
                          ? "bg-slate-50 text-slate-500 border-slate-100"
                          : "bg-slate-600 text-slate-200 border-slate-500")
                      }
                    >
                      Payment Processed By
                    </th>
                    <th
                      className={
                        "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                        (color === "light"
                          ? "bg-slate-50 text-slate-500 border-slate-100"
                          : "bg-slate-600 text-slate-200 border-slate-500")
                      }
                    >
                      Payment Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {testDataList
                    ?.slice(startIndex, endIndex)
                    ?.map((item: any, index: number) => {
                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-100/50 border-b border-gray-200"
                        >
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm whitespace-nowrap p-2 text-left flex items-center">
                            <div>
                              <Link
                                href={`/admin/payments/${item._id}`}
                                className="underline text-blue-800"
                              >
                                <span className="font-bold text-slate-600">
                                  {item?.test_title}
                                </span>
                              </Link>
                              <span className="ml-0 font-thin text-xs italic text-slate-500 block no-underline">
                                {item?.patient?.firstname}{" "}
                                {item?.patient?.lastname}
                              </span>
                              <span className="ml-0 font-thin text-xs italic text-slate-500 block no-underline">
                                {item?.status}
                              </span>
                            </div>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {item?.payment ? (
                              <div>
                                <span className="ml-0 font-bold text-slate-600">
                                  NGN {item?.payment?.amount_paid}
                                </span>

                                <span className="ml-0 font-thin text-xs italic text-slate-400 block no-underline">
                                  Invoice No. {item?.payment?.invoice}
                                </span>
                                <span className="ml-0 font-thin text-xs text-slate-500 block no-underline">
                                  {item?.payment?.payment_option
                                    ?.toString()
                                    .toUpperCase()}
                                </span>
                              </div>
                            ) : (
                              <span className="ml-0 font-bold text-slate-600">
                                {item?.status}
                              </span>
                            )}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {item?.payment ? (
                              <div>
                                <span className="ml-0 font-bold text-slate-600">
                                  {item?.payment?.user?.firstname}{" "}
                                  {item?.payment?.user?.lastname}
                                </span>
                                <span className="ml-0 font-thin text-xs italic text-slate-400 block no-underline">
                                  {item?.payment?.user?.role?.name}
                                </span>
                              </div>
                            ) : (
                              <span className="ml-0 font-bold text-slate-600">
                                {item?.status}
                              </span>
                            )}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {item?.payment ? (
                              <div className="flex flex-col">
                                <span>
                                  {moment(item?.payment?.createdAt).format(
                                    "Do MMM, YYYY"
                                  )}
                                </span>
                                <span>
                                  {moment(item?.payment?.createdAt).format(
                                    "h:mm:ss a"
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span>{item?.status}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div>
              <div className="flex justify-center my-5 px-2">
                <Pagination
                  activePage={testPage}
                  itemsCountPerPage={resPerPage}
                  totalItemsCount={testDataList?.length}
                  pageRangeDisplayed={5}
                  nextPageText={"Next"}
                  prevPageText={"Prev"}
                  firstPageText={"First"}
                  lastPageText={"Last"}
                  onChange={handlePageChange}
                  itemClass="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-200 focus:z-20"
                  activeLinkClass="z-10 inline-flex items-center border border-indigo-500 bg-indigo-200 text-sm font-medium text-indigo-600 focus:z-20"
                  activeClass="z-10 inline-flex items-center border border-indigo-500 bg-indigo-200 text-sm font-medium text-indigo-600 focus:z-20"
                  disabledClass="cursor-not-allowed"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="block w-full overflow-x-auto">
            <div className="my-5">
              <p className="text-center">
                You have no patients record, click on Add New Patient
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

PaymentsData.defaultProps = {
  color: "light",
  addButton: false,
};

PaymentsData.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
  addButton: PropTypes.bool,
};
