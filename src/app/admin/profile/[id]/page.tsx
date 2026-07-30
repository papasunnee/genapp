import AdminNavbar from "@/components/Navbars/AdminNavbar";
import PatientProfile from "@/components/PatientsData/profile";
import Test from "@/components/PatientsData/test";
import PatientsData from "@/components/PatientsData";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "My Profile"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="px-4 md:px-10 mx-auto w-full -m-24">
        <div className="flex flex-wrap">
          <div className="w-full xl:w-4/12 px-4">
            <PatientProfile id={id} />
          </div>
          <div className="w-full xl:w-8/12 px-4">
            <Test color="light" id={id} />
          </div>
          <div className="w-full  px-4">
            <PatientsData />
          </div>
        </div>
      </div>
    </>
  );
}
