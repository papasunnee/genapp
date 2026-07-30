"use client";

import ReactPagination from "react-js-pagination";

type PaginationProps = {
  activePage: number;
  itemsCountPerPage: number;
  totalItemsCount: number;
  pageRangeDisplayed?: number;
  onChange: (page: number) => void;
};

const LINK_CLASS =
  "flex items-center justify-center min-w-9 h-9 px-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer select-none";
const ACTIVE_LINK_CLASS =
  "flex items-center justify-center min-w-9 h-9 px-3 rounded-lg text-sm font-semibold bg-brand-600 text-white cursor-default";

export default function Pagination({
  activePage,
  itemsCountPerPage,
  totalItemsCount,
  pageRangeDisplayed = 5,
  onChange,
}: PaginationProps) {
  return (
    <ReactPagination
      activePage={activePage}
      itemsCountPerPage={itemsCountPerPage}
      totalItemsCount={totalItemsCount}
      pageRangeDisplayed={pageRangeDisplayed}
      onChange={onChange}
      innerClass="flex items-center gap-1 list-none m-0 p-0"
      itemClass="inline-flex"
      activeClass="inline-flex"
      linkClass={LINK_CLASS}
      activeLinkClass={ACTIVE_LINK_CLASS}
      disabledClass="opacity-30 pointer-events-none"
      firstPageText={<i className="fas fa-angle-double-left text-xs" />}
      prevPageText={<i className="fas fa-angle-left text-xs" />}
      nextPageText={<i className="fas fa-angle-right text-xs" />}
      lastPageText={<i className="fas fa-angle-double-right text-xs" />}
    />
  );
}
