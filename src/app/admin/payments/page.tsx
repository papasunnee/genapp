import AdminNavbar from "@/components/Navbars/AdminNavbar";
import PaymentsData from "@/components/PaymentsData";
import PaymentsStats from "@/components/PaymentsData/PaymentsStats";
import { PaymentsFilterProvider } from "@/components/PaymentsData/PaymentsFilterContext";

export default function PaymentsPage() {
  return (
    <PaymentsFilterProvider>
      <AdminNavbar breadCrumb={["Dashboard", "Payments"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <PaymentsStats />
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12 md:px-4">
          <PaymentsData />
        </div>
      </div>
    </PaymentsFilterProvider>
  );
}
