import React from "react";

// components
import PatientsData from "@/components/PatientsData";
import Create from "@/components/PatientsData/create";

// layout for page
import AdminWitoutStats from "@/components/Layout/AdminWithoutStats";
import AdminNavbar from "@/components/Navbars/AdminNavbar";

export default function NewPatient() {
  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "Create Patient"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12">
          <Create />
        </div>
        <div className="w-full mb-12">
          <PatientsData />
        </div>
      </div>
    </>
  );
}

NewPatient.layout = AdminWitoutStats;
