"use client";

import { useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "@/utils/fetcher";
import Pagination from "@/components/ui/Pagination";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const ACTION_META: Record<string, { icon: string; color: string }> = {
  patient: { icon: "fa-user", color: "bg-brand-50 text-brand-700" },
  staff: { icon: "fa-users", color: "bg-violet-50 text-violet-700" },
  role: { icon: "fa-user-shield", color: "bg-violet-50 text-violet-700" },
  catalog: { icon: "fa-flask", color: "bg-amber-50 text-amber-700" },
  branding: { icon: "fa-palette", color: "bg-amber-50 text-amber-700" },
  test: { icon: "fa-vials", color: "bg-emerald-50 text-emerald-700" },
  payment: { icon: "fa-money-bill-wave", color: "bg-emerald-50 text-emerald-700" },
  auth: { icon: "fa-sign-in-alt", color: "bg-slate-100 text-slate-600" },
};

function ActionBadge({ action }: { action: string }) {
  const prefix = action.split(".")[0];
  const meta = ACTION_META[prefix] || { icon: "fa-info-circle", color: "bg-slate-100 text-slate-600" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${meta.color}`}
    >
      <i className={`fas ${meta.icon}`}></i>
      {action}
    </span>
  );
}

export default function ActivityLogData() {
  const { data, isLoading }: any = useSWR("/api/activity-log", fetcher);
  const resPerPage = 15;
  const [page, setPage] = useState(1);

  const logs = data?.data ?? [];
  const startIndex = (page - 1) * resPerPage;
  const pageLogs = logs.slice(startIndex, startIndex + resPerPage);

  return (
    <div className={TABLE_CARD_CLASS}>
      <div className={TABLE_HEADER_CLASS}>
        <h6 className="text-slate-800 text-md md:text-lg font-semibold">
          Activity Log ({logs.length})
        </h6>
        <span className="font-normal text-xs md:text-sm text-slate-400">
          Recent staff actions across your organization
        </span>
      </div>

      {isLoading ? (
        <TableSkeleton columns={3} />
      ) : logs.length > 0 ? (
        <>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className={TABLE_TH_CLASS}>When</th>
                  <th className={TABLE_TH_CLASS}>Who</th>
                  <th className={TABLE_TH_CLASS}>Action</th>
                  <th className={TABLE_TH_CLASS}>Details</th>
                </tr>
              </thead>
              <tbody>
                {pageLogs.map((log: any) => (
                  <tr key={log._id} className={TABLE_TR_CLASS}>
                    <td className={TABLE_TD_CLASS}>
                      <span className="block">{moment(log.createdAt).format("Do MMM, YYYY")}</span>
                      <span className="block text-xs text-slate-400">
                        {moment(log.createdAt).format("h:mm:ss a")}
                      </span>
                    </td>
                    <td className={TABLE_TD_CLASS + " font-medium text-slate-700"}>
                      {log.userLabel}
                    </td>
                    <td className={TABLE_TD_CLASS}>
                      <ActionBadge action={log.action} />
                    </td>
                    <td className={TABLE_TD_CLASS + " whitespace-normal"}>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center my-5 px-2">
            <Pagination
              activePage={page}
              itemsCountPerPage={resPerPage}
              totalItemsCount={logs.length}
              onChange={setPage}
            />
          </div>
        </>
      ) : (
        <div className="my-8">
          <p className="text-center text-sm text-slate-500">No activity recorded yet.</p>
        </div>
      )}
    </div>
  );
}
