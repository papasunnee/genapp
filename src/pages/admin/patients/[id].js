import React from "react";
import Admin from "@/components/Layout/Admin";
import PatientProfile from "@/components/PatientsData/profile";
import Test from "@/components/PatientsData/test";
import PatientsData from "@/components/PatientsData";

const Patient = () => {
  return (
    // <div className="flex flex-wrap mt-4">
    //   <div className="w-full mb-12 px-4">
    //     <PatientProfile />
    //   </div>
    //   <div className="w-full mb-12 px-4">
    //     <Test color="light" />
    //   </div>
    // </div>

    <div className="flex flex-wrap">
      <div className="w-full xl:w-4/12 px-4">
        <PatientProfile />
      </div>
      <div className="w-full xl:w-8/12 px-4">
        <Test color="light" />
      </div>
      <div className="w-full  px-4">
        <PatientsData />
      </div>
    </div>
  );
};

Patient.layout = Admin;
export default Patient;
