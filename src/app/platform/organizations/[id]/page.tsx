import { redirect } from "next/navigation";
import { hasPlatformSession } from "@/lib/platformAuth";
import OrganizationDetail from "@/components/PlatformData/OrganizationDetail";
import LogoutButton from "@/components/PlatformData/LogoutButton";

export default async function PlatformOrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authed = await hasPlatformSession();
  if (!authed) {
    redirect("/platform/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-shield-alt text-brand-600"></i>
            <span className="font-bold text-slate-800">LabSuite Platform</span>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <OrganizationDetail id={id} />
      </main>
    </div>
  );
}
