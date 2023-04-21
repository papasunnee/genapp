import React from "react";
import Admin from "@/components/Layout/Admin";
import PatientProfile from "@/components/PatientsData/profile";
import Test from "@/components/PatientsData/test";

const Patient = () => {
  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-12 px-4">
        <PatientProfile />
      </div>
      <div className="w-full mb-12 px-4">
        <Test color="light" />
      </div>
    </div>
  );
};

Patient.layout = Admin;
export default Patient;
