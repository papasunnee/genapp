import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNavbar from "@/components/Navbars/AdminNavbar";
import OrderTest from "@/components/OrderTest";

export default async function OrderTestPage() {
  const session = await auth();
  if (![100, 200, 500].includes((session?.user as any)?.role?.weight)) {
    redirect("/unauthorized?reason=forbidden");
  }

  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "Order Test"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full relative -m-24">
        <div className="w-full mb-12">
          <OrderTest />
        </div>
      </div>
    </>
  );
}
