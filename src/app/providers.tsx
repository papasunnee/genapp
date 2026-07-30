"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastContainer position="top-right" />
      {children}
    </SessionProvider>
  );
}
