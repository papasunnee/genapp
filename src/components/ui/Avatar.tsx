type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-3xl",
};

function initials(firstname?: string, lastname?: string) {
  const a = firstname?.trim()?.[0] ?? "";
  const b = lastname?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export default function Avatar({
  firstname,
  lastname,
  imageUrl,
  size = "md",
  className = "",
}: {
  firstname?: string;
  lastname?: string;
  imageUrl?: string;
  size?: AvatarSize;
  className?: string;
}) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={imageUrl}
        alt={`${firstname ?? ""} ${lastname ?? ""}`.trim() || "User avatar"}
        className={`${SIZE_CLASS[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }
  return (
    <div
      className={`${SIZE_CLASS[size]} rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
    >
      {initials(firstname, lastname)}
    </div>
  );
}
