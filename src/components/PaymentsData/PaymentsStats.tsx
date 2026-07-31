"use client";

import { formatCurrency } from "@/utils/functions";
import Skeleton from "@/components/ui/Skeleton";
import { usePaymentsFilter } from "./PaymentsFilterContext";

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

export default function PaymentsStats() {
  const { data, isLoading, status, toggleStatus, from, to } = usePaymentsFilter();
  const stats = data?.stats;

  return (
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
  );
}
