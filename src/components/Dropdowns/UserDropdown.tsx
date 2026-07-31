"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";

export default function UserDropdown() {
  const { data }: any = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = data?.user as any;

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open user menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <Avatar
          firstname={user?.firstname}
          lastname={user?.lastname}
          imageUrl={user?.image_url}
          size="sm"
        />
        <i
          className={`fas fa-chevron-down text-xs text-white/70 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      <div
        className={`absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 origin-top-right transition-all duration-150 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="px-4 py-2 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {user?.firstname} {user?.lastname}
          </p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
        <Link
          href="/admin/profile"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <i className="fas fa-id-badge text-slate-400 w-4"></i>
          My Profile
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
        >
          <i className="fas fa-power-off text-red-400 w-4"></i>
          Logout
        </button>
      </div>
    </div>
  );
}
