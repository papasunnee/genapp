"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import Link from "next/link";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import Pagination from "@/components/ui/Pagination";
import TableSkeleton from "@/components/PatientsData/TableSkeleton";
import Skeleton from "@/components/ui/Skeleton";
import {
  TABLE_CARD_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_TH_CLASS,
  TABLE_TR_CLASS,
  TABLE_TD_CLASS,
} from "@/components/ui/table";

const SELECT_CLASS =
  "border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white";
const INPUT_CLASS =
  "border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white";

const STATUS_OPTIONS = ["All", "Awaiting Payment", "Awaiting Result", "Test Completed"];
const LIMIT_OPTIONS = [5, 10, 25, 50];

function StatTile({
  label,
  value,
  icon,
  iconClass,
  active,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: string;
  iconClass: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const Tag: any = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-colors text-left w-full ${
        active ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
      } ${onClick ? "hover:border-brand-300 hover:bg-brand-50/50" : ""}`}
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold truncate">
          {label}
        </p>
        <p className="text-lg font-bold text-slate-800 truncate">{value}</p>
      </div>
    </Tag>
  );
}

export default function PaymentsData() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("All");
  const [paymentOption, setPaymentOption] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [status, paymentOption, search, from, to, limit]);

  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));
  if (status !== "All") query.set("status", status);
  if (paymentOption !== "All") query.set("paymentOption", paymentOption);
  if (search) query.set("search", search);
  if (from) query.set("from", from);
  if (to) query.set("to", to);

  const { data, isLoading }: any = useSWR(`/api/payments?${query.toString()}`, fetcher);
  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const stats = data?.stats;

  const hasActiveFilters =
    status !== "All" || paymentOption !== "All" || search || from || to;

  const clearFilters = () => {
    setStatus("All");
    setPaymentOption("All");
    setSearchInput("");
    setSearch("");
    setFrom("");
    setTo("");
  };

  const toggleStatus = (value: string) => {
    setStatus((current) => (current === value ? "All" : value));
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatTile
              label={from || to ? "Revenue (filtered)" : "Total Revenue"}
              value={formatCurrency(stats.totalRevenue)}
              icon="fa-money-bill-wave"
              iconClass="bg-brand-50 text-brand-600"
            />
            <StatTile
              label="Completed"
              value={stats.completedCount}
              icon="fa-check-circle"
              iconClass="bg-emerald-50 text-emerald-600"
              active={status === "Test Completed"}
              onClick={() => toggleStatus("Test Completed")}
            />
            <StatTile
              label="Awaiting Payment"
              value={stats.awaitingPaymentCount}
              icon="fa-money-check-alt"
              iconClass="bg-red-50 text-red-600"
              active={status === "Awaiting Payment"}
              onClick={() => toggleStatus("Awaiting Payment")}
            />
            <StatTile
              label="Awaiting Result"
              value={stats.awaitingResultCount}
              icon="fa-vial"
              iconClass="bg-orange-50 text-orange-600"
              active={status === "Awaiting Result"}
              onClick={() => toggleStatus("Awaiting Result")}
            />
          </>
        )}
      </div>

      <div className={TABLE_CARD_CLASS}>
        <div className={TABLE_HEADER_CLASS}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="text-slate-800 text-md md:text-lg font-semibold">
                Payment List ({pagination?.total ?? 0})
              </h6>
              <span className="font-normal text-xs md:text-sm text-slate-400">
                Page {pagination?.total ? pagination.page : 0} of {pagination?.totalPages ?? 0}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-grow min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Patient or test name..."
                  className={INPUT_CLASS + " pl-8 w-full"}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={SELECT_CLASS}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Method</label>
              <select
                value={paymentOption}
                onChange={(e) => setPaymentOption(e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="All">All</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Show</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className={SELECT_CLASS}
              >
                {LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors px-2 py-2"
              >
                <i className="fas fa-times mr-1"></i>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton columns={4} />
        ) : rows.length > 0 ? (
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
                  {rows.map((item: any) => (
                    <tr key={item._id} className={TABLE_TR_CLASS}>
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
                activePage={pagination.page}
                itemsCountPerPage={pagination.limit}
                totalItemsCount={pagination.total}
                onChange={setPage}
              />
            </div>
          </>
        ) : (
          <div className="block w-full overflow-x-auto">
            <div className="my-8">
              <p className="text-center text-sm text-slate-500">
                {hasActiveFilters
                  ? "No payments match your filters."
                  : "No payment records yet - they will appear here once a test is ordered."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
