import path from "path";
// Move all usage of 'fs/promises' into functions that only
// run on the server and use dynamic import or require there.

async function getFs() {
  return import("fs/promises");
}

const STORAGE_ROOT =
  process.env.STORAGE_PATH ||
  path.join(process.cwd(), "..", "storage");

/**
 * Get the folder path for an account. Uses accountId in a structured path.
 * Format: storage/accounts/{accountId}/
 */
function getAccountDir(accountId: number): string {
  return path.join(STORAGE_ROOT, "accounts", String(accountId));
}

/**
 * Get the subfolder path for a file type (logo, cover, verification, description).
 * Format: storage/accounts/{accountId}/{type}/
 */
function getAccountSubdir(accountId: number, type: string): string {
  return path.join(getAccountDir(accountId), type);
}

/**
 * Ensure the account storage directory exists.
 */
export async function ensureAccountDir(accountId: number): Promise<string> {
  const dir = getAccountDir(accountId);
  const fs = await getFs();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Save a file to account storage in a type-specific subfolder.
 * Returns the relative path for DB storage.
 * @param accountId - The account ID
 * @param type - Folder name (logo, cover, verification, description, etc.)
 * @param buffer - File buffer
 * @param ext - File extension (e.g. png, jpg, pdf)
 */
export async function saveAccountFile(
  accountId: number,
  type: string,
  buffer: Buffer,
  ext: string
): Promise<string> {
  const fs = await getFs();
  const subdir = getAccountSubdir(accountId, type);
  await fs.mkdir(subdir, { recursive: true });
  const filename = `${type}.${ext}`;
  const filepath = path.join(subdir, filename);
  await fs.writeFile(filepath, buffer);
  return ["accounts", String(accountId), type, filename].join("/");
}

/**
 * Resolve a stored relative path to an absolute filesystem path.
 */
export function resolveStoragePath(relativePath: string): string {
  const resolved = path.resolve(STORAGE_ROOT, relativePath);
  const root = path.resolve(STORAGE_ROOT);
  if (!resolved.startsWith(root)) {
    throw new Error("Invalid storage path");
  }
  return resolved;
}

/**
 * Normalize a stored CoverImage (or any file) value to a relative path for use with
 * resolveStoragePath and /api/files/[...path]. Accepts either:
 * - Full path: C:\...\STORAGE\accounts\26\CampaignCover\204Cover.png
 * - Relative path: accounts/26/CampaignCover/204Cover.png
 * Returns the path with forward slashes, or null if empty/invalid.
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
