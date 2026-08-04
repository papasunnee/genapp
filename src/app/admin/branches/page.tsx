import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNavbar from "@/components/Navbars/AdminNavbar";
import BranchesData from "@/components/BranchesData";

export default async function BranchesPage() {
  const session = await auth();
  if (![100, 200].includes((session?.user as any)?.role?.weight)) {
    redirect("/unauthorized?reason=forbidden");
  }

  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "Branches"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap relative px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12">
          <BranchesData />
        </div>
      </div>
    </>
  );
}
