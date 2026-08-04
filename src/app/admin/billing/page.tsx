import AdminNavbar from "@/components/Navbars/AdminNavbar";
import BillingDashboard from "@/components/Billing/BillingDashboard";

export default function BillingPage() {
  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "Billing"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap relative px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12 md:px-4 max-w-2xl">
          <BillingDashboard />
        </div>
      </div>
    </>
  );
}
