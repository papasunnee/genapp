"use client";

import { SessionProvider } from "next-auth/react";
import { ToastHost } from "@/components/ui/Toast";
import { ConfirmDialogHost } from "@/components/ui/ConfirmDialog";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastHost />
      <ConfirmDialogHost />
      {children}
    </SessionProvider>
  );
}
