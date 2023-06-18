import React, { useState } from "react";
import useSWR from "swr";
import moment from "moment";
import PropTypes from "prop-types";

// components
import TableDropdown from "../Dropdowns/TableDropdown";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import Pagination from "react-js-pagination";

export default function PatientsData({ color, addButton }) {
  const { data } = useSession();
  const { data: patientData } = useSWR("/api/patients", fetcher);
  const { data: dateData } = useSWR("/api/time", fetcher);
  const resPerPage = 5;
  const [testPage, setTestPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);

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
              <h6 className="text-slate-700 text-md md:text-lg font-semibold">
                Patients List ({patientData?.data.length || 0}) <br />
                <span className="font-thin text-xs md:text-sm">
                  Page {patientData ? testPage : 0} of{" "}
                  {Math.ceil((patientData?.data?.length || 0) / resPerPage) ||
                    0}
                </span>
              </h6>
            </div>

            {addButton &&
              [100, 200, 500].includes(data?.user?.role?.weight) && (
                <div>
                  <Link href="/admin/patients/newpatient" legacyBehavior>
                    <a
                      className="bg-emerald-500 text-white active:bg-emerald-600 text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 space-x-1"
                      title="Add New Patient"
                    >
                      <i className="fas fa-plus"></i>
                      <span className="hidden sm:inline-block">
                        Add New Patient
                      </span>
                    </a>
                  </Link>
                </div>
              )}
          </div>
        </div>
        {patientData?.data?.length > 0 ? (
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
                      NAME
                    </th>
                    <th
                      className={
                        "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                        (color === "light"
                          ? "bg-slate-50 text-slate-500 border-slate-100"
                          : "bg-slate-600 text-slate-200 border-slate-500")
                      }
                    >
                      Tests Taken
                    </th>
                    <th
                      className={
                        "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                        (color === "light"
                          ? "bg-slate-50 text-slate-500 border-slate-100"
                          : "bg-slate-600 text-slate-200 border-slate-500")
                      }
                    >
                      Email
                    </th>
                    <th
                      className={
                        "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                        (color === "light"
                          ? "bg-slate-50 text-slate-500 border-slate-100"
                          : "bg-slate-600 text-slate-200 border-slate-500")
                      }
                    >
                      Phone
                    </th>
                    {/* <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-slate-50 text-slate-500 border-slate-100"
                      : "bg-slate-600 text-slate-200 border-slate-500")
                  }
                >
                  Action
                </th> */}
                  </tr>
                </thead>
                <tbody>
                  {patientData?.data
                    ?.slice(startIndex, endIndex)
                    ?.map((item, index) => {
                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-100/50 border-b border-gray-200"
                        >
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm whitespace-nowrap p-2 text-left flex items-center">
                            <div className="hidden h-10 w-10 bg-white rounded-full border md:flex items-center justify-center">
                              <i className="fas fa-user text-xl text-slate-300"></i>
                            </div>
                            {/* <img
                        src="/img/bootstrap.jpg"
                        className="h-12 w-12 bg-white rounded-full border"
                        alt="..."
                      ></img>{" "} */}
                            <div>
                              <Link
                                href={`/admin/patients/${item._id}`}
                                className="underline text-blue-800"
                              >
                                <span className="ml-0 md:ml-3 font-bold text-slate-600">
                                  {item.firstname} {item.lastname}
                                </span>
                              </Link>
                              <span className="ml-0 md:ml-3 font-thin text-xs italic text-slate-500 block no-underline">
                                {moment([
                                  dateData?.currentYear,
                                  dateData?.currentMonth,
                                  dateData?.currentDate,
                                ]).diff(moment(item?.dob), "years")}{" "}
                                years | {item.gender}
                              </span>
                            </div>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {item?.tests?.length || "None"}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {item?.email}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {/* <i className="fas fa-circle text-orange-500 mr-2"></i>{" "}
                      pending */}
                            {item?.phone}
                          </td>
                          {/* <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                        <TableDropdown />
                      </td> */}
                        </tr>
                      );
                    })}
                  {/* <tr>
                <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                  <img
                    src="/img/angular.jpg"
                    className="h-12 w-12 bg-white rounded-full border"
                    alt="..."
                  ></img>{" "}
                  <span
                    className={
                      "ml-3 font-bold " +
                      +(color === "light" ? "text-slate-600" : "text-white")
                    }
                  >
                    Angular Now UI Kit PRO
                  </span>
                </th>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  $1,800 USD
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <i className="fas fa-circle text-emerald-500 mr-2"></i>{" "}
                  completed
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex">
                    <img
                      src="/img/team-1-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow"
                    ></img>
                    <img
                      src="/img/team-2-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></img>
                    <img
                      src="/img/team-3-800x800.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></img>
                    <img
                      src="/img/team-4-470x470.png"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-slate-50 shadow -ml-4"
                    ></img>
                  </div>
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex items-center">
                    <span className="mr-2">100%</span>
                    <div className="relative w-full">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-emerald-200">
                        <div
                          style={{ width: "100%" }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                  <TableDropdown />
                </td>
              </tr> */}
                </tbody>
              </table>
            </div>
            <div>
              <div className="flex justify-center my-5 px-2">
                <Pagination
                  activePage={testPage}
                  itemsCountPerPage={resPerPage}
                  totalItemsCount={patientData?.data?.length}
                  pageRangeDisplayed={5}
                  nextPageText={"Next"}
                  prevPageText={"Prev"}
                  firstPageText={"First"}
                  lastPageText={"Last"}
                  onChange={handlePageChange}
                  itemClass="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-200 focus:z-20"
                  activeLinkClassName="z-10 inline-flex items-center border border-indigo-500 bg-indigo-200 text-sm font-medium text-indigo-600 focus:z-20"
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

PatientsData.defaultProps = {
  color: "light",
  addButton: false,
};

PatientsData.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
  addButton: PropTypes.bool,
};
