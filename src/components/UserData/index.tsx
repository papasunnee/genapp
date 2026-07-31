"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import Pagination from "@/components/ui/Pagination";
import PropTypes from "prop-types";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/Toast";
import { confirmDialog } from "@/components/ui/ConfirmDialog";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

type UserDataProps = {
  addButton?: boolean;
};

export default function UserData({ addButton }: UserDataProps) {
  const { data }: any = useSession();
  const { data: userData, isLoading, mutate }: any = useSWR("/api/users", fetcher);
  const { data: dateData }: any = useSWR("/api/time", fetcher);
  const { data: planData }: any = useSWR("/api/organization/plan", fetcher);

  const resPerPage = 5;
  const [userPage, setUserPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(resPerPage);
  const [userDataList, setUserDataList] = useState<any>([]);

  useEffect(() => {
    setUserDataList(userData?.data);
  }, [userData]);

  const handlePageChange = (currentPage: number) => {
    setUserPage(currentPage);
    setStartIndex((currentPage - 1) * resPerPage);
    setEndIndex(currentPage * resPerPage);
  };

  const canManageStaff = [100, 200].includes(data?.user?.role?.weight);
  const maxStaff = planData?.data?.limits?.maxStaff;
  const staffAtLimit = typeof maxStaff === "number" && (userDataList?.length || 0) >= maxStaff;

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirmDialog({
      title: "Remove staff member",
      message: `Remove "${name}" from staff? This cannot be undone.`,
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed) return;
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_id: id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Staff member removed");
        mutate();
      } else {
        toast.error(json.error || "Failed to remove staff member");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className={TABLE_CARD_CLASS}>
      <div className={TABLE_HEADER_CLASS}>
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="text-slate-800 text-md md:text-lg font-semibold">
              Staff List ({userDataList?.length || 0})
            </h6>
            <span className="font-normal text-xs md:text-sm text-slate-400">
              Page {userDataList?.length ? userPage : 0} of{" "}
              {Math.ceil((userDataList?.length || 0) / resPerPage) || 0}
            </span>
          </div>

          {addButton &&
            [100, 200, 500].includes(data?.user?.role?.weight) &&
            (staffAtLimit ? (
              <div
                title={`Your plan is limited to ${maxStaff} staff accounts`}
                className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold uppercase px-3 py-2 rounded-lg"
              >
                <i className="fas fa-lock"></i>
                <span>Staff limit reached</span>
              </div>
            ) : (
              <div>
                <Link
                  href="/admin/users/newuser"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white active:bg-emerald-700 text-xs font-semibold uppercase px-3 py-2 rounded-lg outline-none focus:outline-none transition-colors space-x-1"
                  title="Add New Staff"
                >
                  <i className="fas fa-plus"></i>
                  <span className="hidden sm:inline-block">Add New Staff</span>
                </Link>
              </div>
            ))}
        </div>
        {staffAtLimit && (
          <p className="text-xs text-amber-600 mt-2">
            You&apos;ve reached your plan&apos;s {maxStaff}-staff limit. Upgrade to add more.
          </p>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton columns={canManageStaff ? 4 : 3} />
      ) : userDataList?.length > 0 ? (
        <>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className={TABLE_TH_CLASS}>Name</th>
                  <th className={TABLE_TH_CLASS}>Age | Gender</th>
                  <th className={TABLE_TH_CLASS}>Email</th>
                  <th className={TABLE_TH_CLASS}>Phone</th>
                  {canManageStaff && (
                    <th className="px-6 align-middle border-b py-3 text-xs uppercase whitespace-nowrap font-semibold text-right tracking-wide bg-slate-50 text-slate-500 border-slate-100">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {userDataList
                  ?.slice(startIndex, endIndex)
                  ?.map((item: any, index: number) => (
                    <tr key={index} className={TABLE_TR_CLASS}>
                      <th className="px-6 align-middle text-sm whitespace-nowrap p-3 text-left flex items-center">
                        <div className="hidden h-10 w-10 bg-slate-100 rounded-full md:flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-user text-lg text-slate-400"></i>
                        </div>
                        <div className="flex flex-col ml-0 md:ml-3">
                          <span className="font-semibold text-slate-700">
                            {item.firstname} {item.lastname}
                          </span>
                          <span className="text-xs italic text-slate-400">
                            {item.role.name}
                          </span>
                        </div>
                      </th>
                      <td className={TABLE_TD_CLASS}>
                        {moment([
                          dateData?.currentYear,
                          dateData?.currentMonth,
                          dateData?.currentDate,
                        ]).diff(moment(item?.dob), "years")}{" "}
                        years &middot; {item.gender}
                      </td>
                      <td className={TABLE_TD_CLASS}>{item?.email}</td>
                      <td className={TABLE_TD_CLASS}>{item?.phone}</td>
                      {canManageStaff && (
                        <td className="px-6 align-middle text-sm whitespace-nowrap p-3 text-right">
                          {item._id !== data?.user?._id && (
                            <button
                              onClick={() =>
                                handleDelete(item._id, `${item.firstname} ${item.lastname}`)
                              }
                              className="text-red-600 hover:text-red-800 text-xs font-semibold uppercase"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center my-5 px-2">
            <Pagination
              activePage={userPage}
              itemsCountPerPage={resPerPage}
              totalItemsCount={userDataList?.length}
              onChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="block w-full overflow-x-auto">
          <div className="my-8">
            <p className="text-center text-sm text-slate-500">
              No staff records yet, click on Add New Staff
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

UserData.defaultProps = {
  addButton: false,
};

UserData.propTypes = {
  addButton: PropTypes.bool,
};
