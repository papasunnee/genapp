import React from "react";

// components
import NewUserForm from "@/components/UserData/NewUserForm";
import UserData from "@/components/UserData";

// layout for page
import Admin from "@/components/Layout/Admin";

export default function NewPatient() {
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <NewUserForm />
        </div>
        <div className="w-full mb-12 px-4">
          <UserData />
        </div>
      </div>
    </>
  );
}

NewPatient.layout = Admin;
