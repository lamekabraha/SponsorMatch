import path from "path";
import fs from "fs/promises";

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
