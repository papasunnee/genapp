import AdminNavbar from "@/components/Navbars/AdminNavbar";
import Create from "@/components/UserData/create";

export default function NewUserPage() {
  return (
    <>
      <AdminNavbar
        breadCrumb={["Dashboard", { label: "Staff", href: "/admin/users" }, "Create Staff"]}
      />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12">
          <Create />
        </div>
      </div>
    </>
  );
}
