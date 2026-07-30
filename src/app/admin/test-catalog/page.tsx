import AdminNavbar from "@/components/Navbars/AdminNavbar";
import TestCatalogData from "@/components/TestCatalogData";

export default function TestCatalogPage() {
  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "Test Catalog"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full relative -m-24">
        <div className="w-full mb-12">
          <TestCatalogData />
        </div>
      </div>
    </>
  );
}
