import React, { useEffect, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import Pagination from "react-js-pagination";
import PropTypes from "prop-types";

// components
import TableDropdown from "../Dropdowns/TableDropdown";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";

export default function UserData({ color, addButton }) {
  const { data, status } = useSession();
  const { data: userData } = useSWR("/api/users", fetcher);
  const { data: dateData } = useSWR("/api/time", fetcher);

  const resPerPage = 5;
  const [userPage, setUserPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);
  const [userDataList, setUserDataList] = useState([]);

  useEffect(() => {
    setUserDataList(userData?.data);
  }, [userData]);

  const handlePageChange = (currentPage) => {
    setUserPage(currentPage);
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
                Staff List <br />
                <span className="font-thin text-sm">
                  Page {userDataList ? userPage : 0} of{" "}
                  {Math.ceil((userDataList?.length || 0) / resPerPage) || 0}
                </span>
              </h3>
            </div>

            {addButton &&
              [100, 200, 500].includes(data?.user?.role?.weight) && (
                <div>
                  <Link href="/admin/users/newuser" legacyBehavior>
                    <a className="bg-emerald-500 text-white active:bg-emerald-600 text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 space-x-1">
                      <i className="fas fa-plus"></i>
                      <span>Add New Staff</span>
                    </a>
                  </Link>
                </div>
              )}
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {/* Users table */}
          {userDataList?.length > 0 ? (
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
                      Age | Gender
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
                    <th
                      className={
                        "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                        (color === "light"
                          ? "bg-slate-50 text-slate-500 border-slate-100"
                          : "bg-slate-600 text-slate-200 border-slate-500")
                      }
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userDataList
                    ?.slice(startIndex, endIndex)
                    ?.map((item, index) => {
                      return (
                        <tr key={index}>
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm whitespace-nowrap p-4 text-left flex items-center">
                            <div className="hidden h-12 w-12 bg-white rounded-full border md:flex items-center justify-center">
                              <i className="fas fa-user text-xl text-slate-300"></i>
                            </div>
                            {/* <img
                        src="/img/bootstrap.jpg"
                        className="h-12 w-12 bg-white rounded-full border"
                        alt="..."
                      ></img>{" "} */}
                            <div className="flex flex-col">
                              <span className="ml-0 md:ml-3 font-bold text-slate-600">
                                {item.firstname} {item.lastname}
                              </span>
                              <span className="text-xs ml-0 md:ml-3 italic font-thin text-slate-400">
                                {item.role.name}
                              </span>
                            </div>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {moment([
                              dateData?.currentYear,
                              dateData?.currentMonth,
                              dateData?.currentDate,
                            ]).diff(moment(item?.dob), "years")}{" "}
                            years | {item.gender}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {item?.email}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {/* <i className="fas fa-circle text-orange-500 mr-2"></i>{" "}
                      pending */}
                            {item?.phone}
                          </td>

                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                            <TableDropdown />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <div className="flex justify-center my-5">
                <Pagination
                  activePage={userPage}
                  itemsCountPerPage={resPerPage}
                  totalItemsCount={userDataList?.length}
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

UserData.defaultProps = {
  color: "light",
  addButton: false,
};

UserData.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
  addButton: PropTypes.bool,
};
