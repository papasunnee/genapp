import type { Metadata } from "next";
import UserManual from "@/components/Marketing/UserManual";

export const metadata: Metadata = {
  title: "User Manual",
  description: "Every module in the LabSuite portal, who can access it, and how to use it.",
};

export default function ManualPage() {
  return <UserManual />;
}
