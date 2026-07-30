"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlatformLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/platform");
        router.refresh();
      } else {
        setError(data.error || "Invalid secret");
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <i className="fas fa-shield-alt text-xl text-brand-600"></i>
          <span className="text-xl font-bold text-slate-800">LabFlow Platform</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-800 text-center mb-1">
          Platform Admin
        </h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          Enter the platform secret to continue
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            <i className="fas fa-exclamation-circle mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-1"
              htmlFor="platform-secret"
            >
              Platform Secret
            </label>
            <input
              id="platform-secret"
              type="password"
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              autoFocus
            />
          </div>
          <button
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
