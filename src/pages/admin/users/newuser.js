import React from "react";

// components
import Create from "@/components/UserData/create";
import UserData from "@/components/UserData";

// layout for page
import Admin from "@/components/Layout/Admin";

export default function NewUser() {
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <Create />
        </div>
        <div className="w-full mb-12 px-4">
          <UserData />
        </div>
      </div>
    </>
  );
}

NewUser.layout = Admin;
