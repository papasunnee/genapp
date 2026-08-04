"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Skeleton from "@/components/ui/Skeleton";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  weights?: number[];
  comingSoon?: boolean;
  external?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "fa-tv" }],
  },
  {
    label: "Clinical",
    items: [
      { href: "/admin/order-test", label: "Order Test", icon: "fa-cart-plus", weights: [100, 200, 500] },
      { href: "/admin/appointments", label: "Appointments", icon: "fa-calendar-check", weights: [100, 200, 300, 500] },
      { href: "/admin/patients", label: "Patients", icon: "fa-user" },
      { href: "/admin/results", label: "Results", icon: "fa-list", weights: [100, 200, 300] },
      { href: "/admin/test-catalog", label: "Test Catalog", icon: "fa-flask", weights: [100, 200] },
      { href: "/admin/qc-logs", label: "QC Log", icon: "fa-vial", weights: [100, 200, 300] },
      { href: "/admin/maintenance-log", label: "Maintenance Log", icon: "fa-tools", weights: [100, 200, 300] },
      { href: "/admin/referrers", label: "Referrers", icon: "fa-user-md", weights: [100, 200, 500] },
      {
        href: "/admin/inventory",
        label: "Inventory",
        icon: "fa-boxes",
        weights: [100, 200, 300],
        comingSoon: true,
      },
      {
        href: "/admin/sms-notifications",
        label: "SMS/WhatsApp Alerts",
        icon: "fa-comment-dots",
        weights: [100, 200, 300, 500],
        comingSoon: true,
      },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/admin/payments", label: "Payments", icon: "fa-fingerprint", weights: [100, 200, 400] },
      { href: "/admin/invoices", label: "Invoices", icon: "fa-file-invoice-dollar", weights: [100, 200, 400] },
      { href: "/admin/reports", label: "Reports", icon: "fa-chart-bar", weights: [100, 200, 400] },
      { href: "/admin/billing", label: "Subscription", icon: "fa-credit-card", weights: [100, 200] },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/users", label: "Staff/Users", icon: "fa-users", weights: [100, 200, 500] },
      { href: "/admin/roles", label: "Roles", icon: "fa-user-shield", weights: [100, 200] },
      { href: "/admin/branches", label: "Branches", icon: "fa-code-branch", weights: [100, 200] },
      { href: "/admin/settings", label: "Settings", icon: "fa-cog", weights: [100, 200] },
      { href: "/admin/activity-log", label: "Activity Log", icon: "fa-history", weights: [100] },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/admin/profile", label: "My Profile", icon: "fa-id-badge" },
      { href: "/manual", label: "User Manual", icon: "fa-book", external: true },
    ],
  },
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
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
      >
        <i className={`fas ${item.icon} w-4 text-center text-slate-400`}></i>
        <span className="flex-1">{item.label}</span>
        <i className="fas fa-external-link-alt text-[10px] text-slate-300"></i>
      </a>
    );
  }

  if (item.comingSoon) {
    return (
      <div
        title={`${item.label} - coming soon`}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-default select-none"
      >
        <i className={`fas ${item.icon} w-4 text-center text-slate-300`}></i>
        <span className="flex-1">{item.label}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
          Soon
        </span>
      </div>
    );
  }

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
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.weights || item.weights.includes(roleWeight)),
  })).filter((group) => group.items.length > 0);

  const navGroups = (
    <div className="px-3 space-y-5">
      {visibleGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => (
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
      ))}
    </div>
  );

  const userFooter = (
    <Link
      href="/admin/profile"
      className="flex-shrink-0 block px-6 py-4 border-t border-slate-100 hover:bg-slate-50 transition-colors"
    >
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
              {(data.user as any).firstname} {(data.user as any).lastname}
            </span>
            <span className="text-slate-400 text-xs">{(data.user as any).role?.name}</span>
          </div>
        )
      )}
    </Link>
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
        className={`md:hidden fixed top-0 left-0 bottom-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-200 flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-shrink-0 px-4 py-4 flex items-center justify-between border-b border-slate-100">
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
        <div className="flex-1 min-h-0 overflow-y-auto py-4">{navGroups}</div>
        {userFooter}
      </div>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:bottom-0 md:w-64 bg-white border-r border-slate-200">
        <Link
          href="/admin"
          className="flex-shrink-0 px-6 py-4 border-b border-slate-100 text-slate-700 text-sm font-bold truncate block"
        >
          {orgName}
        </Link>
        <div className="flex-1 min-h-0 overflow-y-auto py-4">{navGroups}</div>
        {userFooter}
      </nav>
    </>
  );
}
