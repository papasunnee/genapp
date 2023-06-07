import React from "react";
import useSWR from "swr";
import moment from "moment";
import PropTypes from "prop-types";

// components
import TableDropdown from "../Dropdowns/TableDropdown";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";

export default function UserData({ color, addButton }) {
  const { data: userData } = useSWR("/api/users", fetcher);
  const { data: dateData } = useSWR("/api/time", fetcher);

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
              <h3 className="font-bold text-xl text-slate-700">Staff List</h3>
            </div>

            {addButton && (
              <div>
                <Link href="/admin/users/newuser" legacyBehavior>
                  <a className="bg-emerald-500 text-white active:bg-emerald-600 text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 space-x-1">
                    <i className="fas fa-plus"></i>
                    <span>Add New User</span>
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {/* Users table */}
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
                  PATIENT
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " +
                    (color === "light"
                      ? "bg-slate-50 text-slate-500 border-slate-100"
                      : "bg-slate-600 text-slate-200 border-slate-500")
                  }
                >
                  Age
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
              {userData?.data?.map((item, index) => {
                return (
                  <tr key={index}>
                    <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                      <div className="h-12 w-12 bg-white rounded-full border flex items-center justify-center">
                        <i className="fas fa-user text-xl text-slate-300"></i>
                      </div>
                      {/* <img
                        src="/img/bootstrap.jpg"
                        className="h-12 w-12 bg-white rounded-full border"
                        alt="..."
                      ></img>{" "} */}
                      <span className="ml-3 font-bold text-slate-600">
                        {item.firstname} {item.lastname}
                      </span>
                    </th>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {moment([
                        dateData?.currentYear,
                        dateData?.currentMonth,
                        dateData?.currentDate,
                      ]).diff(moment(item?.dob), "years")}{" "}
                      years
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
