"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function DemoEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEnterDemo = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/demo/prepare", { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Could not prepare the demo. Please try again.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: json.data.email,
        password: json.data.password,
        subdomain: json.data.subdomain,
        redirect: false,
      });

      if (result?.error) {
        setError("Could not sign in to the demo. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto mb-5">
          <i className="fas fa-flask text-2xl"></i>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Try the LabSuite Demo</h1>
        <p className="text-sm text-slate-500 mt-3">
          A shared sandbox with sample patients and tests already loaded - explore the full
          workflow, no signup required.
        </p>
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-4 text-left">
          <i className="fas fa-info-circle mr-1.5"></i>
          This is a public, shared demo. Data resets periodically, and a few settings (letterhead
          branding, custom roles, catalog editing) are disabled.
        </p>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <button
          type="button"
          onClick={handleEnterDemo}
          disabled={loading}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-3 transition-colors"
        >
          {loading && <i className="fas fa-spinner fa-spin"></i>}
          {loading ? "Preparing demo..." : "Enter the Demo"}
        </button>
        <a
          href="/"
          className="block text-xs text-slate-400 mt-4 hover:text-slate-600 transition-colors"
        >
          &larr; Back to home
        </a>
      </div>
    </div>
  );
}
