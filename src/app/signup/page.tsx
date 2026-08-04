import { Suspense } from "react";
import SignupForm from "@/components/Marketing/SignupForm";

export const metadata = {
  title: "Sign Up",
  description:
    "Create your lab's private LabSuite workspace - choose Free, Starter, or Pro and get your own address in minutes.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
