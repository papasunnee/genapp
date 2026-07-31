"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";

type PaymentsFilterState = {
  page: number;
  setPage: (p: number) => void;
  limit: number;
  setLimit: (n: number) => void;
  status: string;
  setStatus: (s: string) => void;
  paymentOption: string;
  setPaymentOption: (s: string) => void;
  searchInput: string;
  setSearchInput: (s: string) => void;
  from: string;
  setFrom: (s: string) => void;
  to: string;
  setTo: (s: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  toggleStatus: (value: string) => void;
  data: any;
  isLoading: boolean;
};

const PaymentsFilterContext = createContext<PaymentsFilterState | null>(null);

export function usePaymentsFilter() {
  const ctx = useContext(PaymentsFilterContext);
  if (!ctx) {
    throw new Error("usePaymentsFilter must be used within PaymentsFilterProvider");
  }
  return ctx;
}

// Shared across PaymentsStats (rendered in the page's dark banner) and
// PaymentsData's table (rendered in the overlapping card below it) - one
// SWR fetch, one set of filter state, so the two stay in sync without
// either duplicating requests or needing prop-drilling across a DOM
// structure that isn't actually nested.
export function PaymentsFilterProvider({ children }: { children: ReactNode }) {
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

  const hasActiveFilters =
    status !== "All" || paymentOption !== "All" || !!search || !!from || !!to;

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
    <PaymentsFilterContext.Provider
      value={{
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
        toggleStatus,
        data,
        isLoading,
      }}
    >
      {children}
    </PaymentsFilterContext.Provider>
  );
}
