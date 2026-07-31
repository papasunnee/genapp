"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import moment from "moment";
import UserDropdown from "../Dropdowns/UserDropdown";

export default function AdminNavbar({
  breadCrumb = ["Dashboard"],
}: {
  breadCrumb?: string[];
}) {
  const { data }: any = useSession();
  const [today, setToday] = useState<string | null>(null);

  // Computed after mount only, so the server-rendered and first client
  // render match exactly - a formatted "today" would otherwise risk a
  // hydration mismatch if the two happen to straddle midnight.
  useEffect(() => {
    setToday(moment().format("dddd, MMMM D"));
  }, []);

  const firstname = data?.user?.firstname as string | undefined;
  const isDashboard = breadCrumb.length === 1;

  return (
    <nav className="absolute top-0 left-0 w-full z-10 bg-transparent flex items-center p-4">
      <div className="w-full mx-auto flex items-center justify-between flex-wrap md:px-10 px-4 gap-3">
        <div>
          <div className="flex items-center flex-wrap text-xs uppercase font-semibold">
            {breadCrumb.map((item, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && (
                  <i className="fas fa-chevron-right text-[9px] mx-2 text-white/40"></i>
                )}
                {index === 0 ? (
                  <Link href="/admin" className="text-white hover:text-white/80 transition-colors">
                    {item}
                  </Link>
                ) : (
                  <span className="text-white/70">{item}</span>
                )}
              </span>
            ))}
          </div>
          {isDashboard && (
            <h1 className="text-white text-lg font-semibold mt-1">
              Welcome back{firstname ? `, ${firstname}` : ""}
            </h1>
          )}
          {today && <p className="text-white/50 text-xs mt-1">{today}</p>}
        </div>

        <ul className="flex items-center list-none">
          <UserDropdown />
        </ul>
      </div>
    </nav>
  );
}
