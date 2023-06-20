import React, { useEffect } from "react";

// components
import AdminNavbar from "../Navbars/AdminNavbar";
import FooterAdmin from "../Footers/FooterAdmin";
import HeaderStats from "../Headers/HeaderStats";
import Sidebar from "../Sidebar/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdminWitoutStats({ children }) {
  const session = useSession();
  const { status, data } = session;
  const router = useRouter();
  useEffect(() => {
    if (status == "unauthenticated") {
      router.replace("/");
    }
  }, [status, data]);

  if (status == "authenticated" && data != "undefined" && data != undefined) {
    return (
      <>
        <Sidebar />
        <div className="relative md:ml-64 bg-slate-100">
          {/* <AdminNavbar /> */}
          {/* Header */}
          {children}
          <div className="px-4 md:px-10 mx-auto w-full mt-24">
            <FooterAdmin />
          </div>
        </div>
      </>
    );
  }
}
