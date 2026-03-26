import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";

/** Server-only — do not import from Client Components (use `useSession` from `next-auth/react`). */
export async function getSession() {
  return getServerSession(authConfig);
}
