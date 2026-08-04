import { Suspense } from "react";
import SignupForm from "@/components/Marketing/SignupForm";

export const metadata = {
  title: "Sign Up - LabSuite",
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
