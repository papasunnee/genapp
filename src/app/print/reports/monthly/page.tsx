import { Suspense } from "react";
import MonthlyReportPrint from "@/components/ReportsData/MonthlyReportPrint";

export default function MonthlyReportPrintPage() {
  return (
    <Suspense fallback={null}>
      <MonthlyReportPrint />
    </Suspense>
  );
}
