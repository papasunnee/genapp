import React, { useEffect, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import Pagination from "react-js-pagination";
import PropTypes from "prop-types";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";

// components

export default function ResultsData({ color, addButton }) {
  const resPerPage = 5;
  const [testPage, setTestPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);
  const [selectFilter, setSelectFilter] = useState("All");

  const [testDataList, setTestDataList] = useState([]);
  const { data: testData } = useSWR("/api/diagnosis", fetcher);

  useEffect(() => {
    setTestDataList(testData?.data);
  }, [testData]);
  const handleSelectChange = async (e) => {
    const { value, name } = e.target;
    try {
      const filtered = testData?.data?.filter((item) => {
        if (value == "All") return true;
        return item.status == value;
      });
      setSelectFilter(value);
      setTestPage(1);
      setStartIndex(0);
      setEndIndex(resPerPage);
      setTestDataList(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (currentPage) => {
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
              <h3 className="font-bold text-xl text-slate-700">
                Result List ({testDataList?.length || 0}) <br />
                <span className="font-thin text-sm">
                  Page {testDataList ? testPage : 0} of{" "}
                  {Math.ceil((testDataList?.length || 0) / resPerPage) || 0}
                </span>
              </h3>
            </div>
            <form>
              <select
                onChange={handleSelectChange}
                value={selectFilter}
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
        <div className="block w-full overflow-x-auto">
          {/* Projects table */}
          {testDataList?.length > 0 ? (
            <>
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
                    ?.map((item, index) => {
                      console.log({ item });
                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-100/50 border-b border-gray-200 transition duration-300 ease-in-out hover:bg-gray-200"
                        >
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm whitespace-nowrap p-4 text-left flex items-center">
                            <div className="">
                              <Link
                                href={`/admin/results/${item._id}`}
                                className="underline text-blue-800"
                              >
                                <span className="font-bold text-slate-600">
                                  {item?.test_title}
                                </span>
                              </Link>
                              <span className="font-thin text-xs italic text-slate-500 block no-underline">
                                {`${item?.patient?.firstname ?? ""} ${
                                  item?.patient?.latname ?? ""
                                }`}
                              </span>
                            </div>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {item?.payment ? (
                              <div>
                                <span className="font-bold text-slate-600">
                                  NGN {item?.payment?.amount_paid}
                                </span>

                                <span className="font-thin text-xs italic text-slate-400 block no-underline">
                                  Invoice No. {item?.payment?.invoice}
                                </span>
                                <span className="font-thin text-xs text-slate-500 block no-underline">
                                  {item?.payment?.payment_option
                                    ?.toString()
                                    .toUpperCase()}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-slate-600">
                                {item?.status}
                              </span>
                            )}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {item?.payment ? (
                              <div>
                                <span className="font-bold text-slate-600">
                                  {item?.payment?.user?.firstname}{" "}
                                  {item?.payment?.user?.lastname}
                                </span>
                                <span className="font-thin text-xs italic text-slate-400 block no-underline">
                                  {item?.payment?.user?.role?.name}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-slate-600">
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
              <div className="flex justify-center my-5">
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
                  activeLinkClassName="z-10 inline-flex items-center border border-indigo-500 bg-indigo-200 text-sm font-medium text-indigo-600 focus:z-20"
                  activeClass="z-10 inline-flex items-center border border-indigo-500 bg-indigo-200 text-sm font-medium text-indigo-600 focus:z-20"
                />
              </div>
            </>
          ) : (
            <div className="my-5">
              <p className="text-center">No Test Record Found at the moment</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

ResultsData.defaultProps = {
  color: "light",
  addButton: false,
};

ResultsData.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
  addButton: PropTypes.bool,
};
