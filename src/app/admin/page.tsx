import AdminNavbar from "@/components/Navbars/AdminNavbar";
import HeaderStats from "@/components/Headers/HeaderStats";
import CardLineChart from "@/components/Cards/CardLineChart";
import CardBarChart from "@/components/Cards/CardBarChart";

export default function AdminIndexPage() {
  return (
    <>
      <AdminNavbar />
      <HeaderStats />
      <div className="px-4 md:px-10 mx-auto w-full -m-24">
        <div className="flex flex-wrap">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <CardLineChart />
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <CardBarChart />
          </div>
        </div>
      </div>
    </>
  );
}
