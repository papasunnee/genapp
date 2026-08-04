import type { Metadata } from "next";
import DemoEntry from "@/components/Marketing/DemoEntry";

export const metadata: Metadata = {
  title: "Try the Demo",
  description:
    "Explore LabSuite's full workflow in a shared public sandbox - sample patients and tests already loaded, no signup required.",
};

export default function DemoPage() {
  return <DemoEntry />;
}
