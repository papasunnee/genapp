import { Connection } from "mongoose";
import type { Session } from "next-auth";
import { getActivityLogModel } from "@/models/ActivityLog";

/**
 * Best-effort audit log write - failures here must never break the
 * mutation they're describing, so errors are swallowed rather than
 * propagated. Called after the real operation has already succeeded.
 */
export async function logActivity(
  connection: Connection,
  session: Session | null,
  action: string,
  description: string
): Promise<void> {
  try {
    const user = session?.user as any;
    const userLabel = user
      ? `${user.firstname ?? ""} ${user.lastname ?? ""}${
          user.role?.name ? ` (${user.role.name})` : ""
        }`.trim()
      : "System";

    const ActivityLog = getActivityLogModel(connection);
    await ActivityLog.create({
      user: user?._id,
      userLabel: userLabel || "Unknown",
      action,
      description,
    });
  } catch {
    // Swallow - logging is observability, not a critical path.
  }
}
