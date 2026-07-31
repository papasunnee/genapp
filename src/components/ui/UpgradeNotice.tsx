export default function UpgradeNotice({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
      <i className="fas fa-lock text-amber-500 mt-0.5"></i>
      <div>
        <p className="text-sm font-semibold text-amber-800">{title}</p>
        <p className="text-sm text-amber-700 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
