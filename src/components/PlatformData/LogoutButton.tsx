"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/platform/logout", { method: "POST" });
    router.push("/platform/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-slate-500 hover:text-slate-700 font-medium"
    >
      <i className="fas fa-sign-out-alt mr-1"></i>
      Logout
    </button>
  );
}
