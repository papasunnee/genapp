import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNavbar from "@/components/Navbars/AdminNavbar";
import UserData from "@/components/UserData";

export default async function UsersPage() {
  const session = await auth();
  if ((session?.user as any)?.role?.weight === 400) {
    redirect("/unauthorized");
  }

  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "Staff"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12">
          <UserData addButton />
        </div>
      </div>
    </>
  );
}
