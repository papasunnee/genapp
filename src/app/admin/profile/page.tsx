import AdminNavbar from "@/components/Navbars/AdminNavbar";
import Profile from "@/components/UserData/profile";

export default function MyProfilePage() {
  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "My Profile"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12 md:px-4">
          <Profile />
        </div>
      </div>
    </>
  );
}
