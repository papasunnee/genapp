"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { getLogoutDestination } from "@/lib/logoutDestination";
import Skeleton from "@/components/ui/Skeleton";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  weights?: number[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "fa-tv" },
  { href: "/admin/order-test", label: "Order Test", icon: "fa-cart-plus", weights: [100, 200, 500] },
  { href: "/admin/patients", label: "Patients", icon: "fa-user" },
  { href: "/admin/users", label: "Staff/Users", icon: "fa-users", weights: [100, 200, 500] },
  { href: "/admin/roles", label: "Roles", icon: "fa-user-shield", weights: [100, 200] },
  { href: "/admin/results", label: "Results", icon: "fa-list", weights: [100, 200, 300] },
  { href: "/admin/payments", label: "Payments", icon: "fa-fingerprint", weights: [100, 200, 400] },
  { href: "/admin/invoices", label: "Invoices", icon: "fa-file-invoice-dollar", weights: [100, 200, 400] },
  { href: "/admin/test-catalog", label: "Test Catalog", icon: "fa-flask", weights: [100, 200] },
  { href: "/admin/settings", label: "Settings", icon: "fa-cog", weights: [100, 200] },
  { href: "/admin/activity-log", label: "Activity Log", icon: "fa-history", weights: [100] },
  { href: "/admin/profile", label: "My Profile", icon: "fa-id-badge" },
];

function isItemActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.href)}
      className={
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
        (active
          ? "bg-brand-50 text-brand-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800")
      }
    >
      <i
        className={`fas ${item.icon} w-4 text-center ${
          active ? "text-brand-600" : "text-slate-400"
        }`}
      ></i>
      {item.label}
    </button>
  );
}

export default function Sidebar({ orgName }: { orgName: string }) {
  const { data, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() ?? "";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const roleWeight = (data?.user as any)?.role?.weight;
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.weights || item.weights.includes(roleWeight)
  );

  const navContent = (
    <>
      <div className="px-3">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
          Admin
        </p>
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={isItemActive(pathname, item.href)}
                onNavigate={handleNavigate}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="px-3 mt-6">
        <hr className="border-slate-100 mb-4" />
        <button
          type="button"
          onClick={() =>
            signOut({ callbackUrl: `${window.location.origin}${getLogoutDestination(data)}` })
          }
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        >
          <i className="fas fa-power-off w-4 text-center text-slate-400"></i>
          Logout
        </button>
      </div>

      <div className="px-6 mt-6">
        <hr className="border-slate-100 mb-4" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
          Logged in as
        </p>
        {status === "loading" ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        ) : (
          data?.user && (
            <div className="flex flex-col">
              <span className="text-slate-700 text-sm font-semibold">
                {(data.user as any).role?.name}
              </span>
              <span className="text-slate-400 text-xs">
                {(data.user as any).firstname} {(data.user as any).lastname}
              </span>
            </div>
          )
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 h-16">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <i className="fas fa-bars"></i>
        </button>
        <span className="text-sm font-semibold text-slate-700 truncate">{orgName}</span>
        <div className="w-9" />
      </div>

      {/* Mobile drawer backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-200 flex flex-col py-4 overflow-y-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-700 truncate">{orgName}</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        {navContent}
      </div>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:bottom-0 md:w-64 bg-white border-r border-slate-200 py-4 overflow-y-auto">
        <Link
          href="/admin"
          className="px-6 pb-4 mb-4 border-b border-slate-100 text-slate-700 text-sm font-bold truncate block"
        >
          {orgName}
        </Link>
        {navContent}
      </nav>
    </>
  );
}
