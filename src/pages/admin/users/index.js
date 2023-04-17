import React from "react";

// components
import UserData from "@/components/UserData";

// layout for page
import Admin from "@/components/Layout/Admin";

export default function Index() {
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <UserData addButton />
        </div>
      </div>
    </>
  );
}

Index.layout = Admin;
