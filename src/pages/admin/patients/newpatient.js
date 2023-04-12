import React from "react";

// components
import PatientsData from "@/components/PatientsData";
import NewPatient from "@/components/PatientsData/NewPatient";

// layout for page
import Admin from "@/components/Layout/Admin";

export default function Index() {
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <NewPatient />
        </div>
        <div className="w-full mb-12 px-4">
          <PatientsData />
        </div>
      </div>
    </>
  );
}

Index.layout = Admin;
