import AdminNavbar from "@/components/Navbars/AdminNavbar";
import SingleTest from "@/components/PaymentsData/singleTest";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <AdminNavbar
        breadCrumb={["Dashboard", { label: "Payments", href: "/admin/payments" }, "Payment Data"]}
      />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12">
          <SingleTest id={id} />
        </div>
      </div>
    </>
  );
}
