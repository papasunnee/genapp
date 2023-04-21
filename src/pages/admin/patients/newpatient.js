import React from "react";

// components
import PatientsData from "@/components/PatientsData";
import Create from "@/components/PatientsData/create";

// layout for page
import Admin from "@/components/Layout/Admin";

export default function NewPatient() {
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <Create />
        </div>
        <div className="w-full mb-12 px-4">
          <PatientsData />
        </div>
      </div>
    </>
  );
}

NewPatient.layout = Admin;
