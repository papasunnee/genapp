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
import Modal from "@/components/ui/Modal";
import ActionMenu from "@/components/ui/ActionMenu";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const LABEL_CLASS = "block text-sm font-medium text-slate-700 mb-1";

const STATUS_BADGE: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Suspended: "bg-amber-50 text-amber-700",
  Quit: "bg-slate-100 text-slate-500",
  Sacked: "bg-red-50 text-red-700",
};

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

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

  const [resetTarget, setResetTarget] = useState<{ _id: string; label: string } | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

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
      message: `Permanently remove "${name}"? This deletes their login credentials and cannot be undone - consider Suspend instead if you just want to block sign-in.`,
      confirmLabel: "Remove permanently",
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

  const handleToggleStatus = async (item: any) => {
    const nextStatus = item.status === "Active" ? "Suspended" : "Active";
    if (nextStatus === "Suspended") {
      const confirmed = await confirmDialog({
        title: "Suspend staff member",
        message: `Suspend "${item.firstname} ${item.lastname}"? They won't be able to sign in until reactivated - nothing they've created is affected.`,
        confirmLabel: "Suspend",
        cancelLabel: "Cancel",
        danger: true,
      });
      if (!confirmed) return;
    }
    try {
      const res = await fetch(`/api/users/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(nextStatus === "Active" ? "Staff member reactivated" : "Staff member suspended");
        mutate();
      } else {
        toast.error(json.error || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openResetPassword = (item: any) => {
    setResetTarget({ _id: item._id, label: `${item.firstname} ${item.lastname}` });
    setResetPassword(generatePassword());
    setResetDone(false);
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (resetPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setResetting(true);
    try {
      const res = await fetch(`/api/users/${resetTarget._id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetPassword }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Password reset for ${resetTarget.label}`);
        setResetDone(true);
      } else {
        toast.error(json.error || "Failed to reset password");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setResetting(false);
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
        <TableSkeleton columns={canManageStaff ? 5 : 4} />
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
                  <th className={TABLE_TH_CLASS}>Status</th>
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
                      <td className={TABLE_TD_CLASS}>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            STATUS_BADGE[item.status] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {canManageStaff && (
                        <td className="px-6 align-middle text-sm whitespace-nowrap p-3 text-right">
                          {item._id !== data?.user?._id && (
                            <ActionMenu
                              items={[
                                {
                                  label: item.status === "Active" ? "Suspend" : "Reactivate",
                                  icon: item.status === "Active" ? "fa-ban" : "fa-check-circle",
                                  onClick: () => handleToggleStatus(item),
                                },
                                {
                                  label: "Reset Password",
                                  icon: "fa-key",
                                  onClick: () => openResetPassword(item),
                                },
                                {
                                  label: "Remove Permanently",
                                  icon: "fa-trash-alt",
                                  danger: true,
                                  onClick: () =>
                                    handleDelete(item._id, `${item.firstname} ${item.lastname}`),
                                },
                              ]}
                            />
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

      <Modal
        open={!!resetTarget}
        title={`Reset Password${resetTarget ? ` - ${resetTarget.label}` : ""}`}
        onClose={() => setResetTarget(null)}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>New Password</label>
            <div className="flex gap-2">
              <input
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                disabled={resetDone}
                className={INPUT_CLASS}
              />
              {!resetDone && (
                <button
                  type="button"
                  onClick={() => setResetPassword(generatePassword())}
                  className="rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 text-sm flex-shrink-0"
                  title="Generate a new random password"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">At least 8 characters.</p>
          </div>

          {resetDone ? (
            <>
              <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                <i className="fas fa-check-circle mr-1"></i>
                Password reset. Share this with {resetTarget?.label} through a secure channel -
                it won&apos;t be shown again after you close this.
              </p>
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
              >
                Done
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetPassword}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              {resetting && <i className="fas fa-spinner fa-spin"></i>}
              {resetting ? "Resetting..." : "Reset Password"}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

UserData.defaultProps = {
  addButton: false,
};

UserData.propTypes = {
  addButton: PropTypes.bool,
};
