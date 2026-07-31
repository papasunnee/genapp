"use client";

import moment from "moment";
import Link from "next/link";
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
import { usePaymentsFilter } from "./PaymentsFilterContext";

const SELECT_CLASS =
  "border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white";
const INPUT_CLASS =
  "border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white";

const STATUS_OPTIONS = ["All", "Awaiting Payment", "Awaiting Result", "Test Completed"];
const LIMIT_OPTIONS = [5, 10, 25, 50];

export default function PaymentsData() {
  const {
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
    paymentOption,
    setPaymentOption,
    searchInput,
    setSearchInput,
    from,
    setFrom,
    to,
    setTo,
    hasActiveFilters,
    clearFilters,
    data,
    isLoading,
  } = usePaymentsFilter();

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
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
                        <span className="font-semibold text-slate-500">{item?.status}</span>
                      )}
                    </td>
                    <td className={TABLE_TD_CLASS}>
                      {item?.payment ? (
                        <div>
                          <span className="font-semibold text-slate-700">
                            {item?.payment?.user?.firstname} {item?.payment?.user?.lastname}
                          </span>
                          <span className="font-normal text-xs italic text-slate-400 block">
                            {item?.payment?.user?.role?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-500">{item?.status}</span>
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
  );
}
