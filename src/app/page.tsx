import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Auth from "@/components/Layout/Auth";
import Login from "@/components/Form/Login";

export default async function IndexPage() {
  const session = await auth();
  if (session) {
    redirect("/admin");
  }

  return (
    <Auth>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <Login />
        </div>
      </div>
    </Auth>
  );
}
