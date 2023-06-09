import React from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
// components
import Create from "@/components/UserData/create";
import UserData from "@/components/UserData";

// layout for page
import AdminWitoutStats from "@/components/Layout/AdminWithoutStats";
import AdminNavbar from "@/components/Navbars/AdminNavbar";

export default function NewUser() {
  const router = useRouter();
  const { data, status } = useSession();
  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "Create Staff"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full -m-24">
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

NewUser.layout = AdminWitoutStats;
