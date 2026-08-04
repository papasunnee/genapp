import Link from "next/link";

export default function LegalPageShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-slate-800">
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <i className="fas fa-flask text-sm"></i>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">LabSuite</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-400 mt-2">Last updated: {updated}</p>
        <div className="mt-10 space-y-8 text-sm text-slate-600 leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-3">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} LabSuite. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-600 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-slate-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
