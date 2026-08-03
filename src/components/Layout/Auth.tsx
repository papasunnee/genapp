import React from "react";

export default function Auth({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 text-white p-12">
        <div className="flex items-center space-x-2">
          <i className="fas fa-flask text-2xl"></i>
          <span className="text-2xl font-bold tracking-tight">LabSuite</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-snug mb-4">
            Modern lab management, built for every kind of lab.
          </h1>
          <p className="text-brand-100 text-sm">
            Patients, test ordering, results, and billing - all in one place.
          </p>
        </div>
        <div className="text-xs text-brand-200">
          &copy; {new Date().getFullYear()} LabSuite
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-10">
            <i className="fas fa-flask text-xl text-brand-600"></i>
            <span className="text-xl font-bold text-slate-800">LabSuite</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
