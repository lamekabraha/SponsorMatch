/**
 * Browser-safe helpers for storage path values stored in the DB.
 * This file must not import Node-only modules like `fs` or `path` so it can be used
 * from Client Components.
 */

export function toStorageRelativePath(
  storedValue: string | null | undefined
): string | null {
  if (storedValue == null || String(storedValue).trim() === "") return null;
  const raw = String(storedValue).trim();
  const normalized = raw.replace(/\\/g, "/");
  const accountsIndex = normalized.indexOf("accounts/");
  if (accountsIndex !== -1) {
    return normalized.slice(accountsIndex);
  }
  if (normalized.startsWith("accounts")) return normalized;
  return null;
}

