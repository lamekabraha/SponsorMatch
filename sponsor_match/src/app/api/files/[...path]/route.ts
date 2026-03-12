import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { resolveStoragePath } from "@/lib/storage";

type RouteParams = {
  params: {
    path: string[];
  };
};

async function getAccountId(): Promise<number | null> {
  const session = await getServerSession(authConfig);
  return (session?.user as { accountId?: number })?.accountId ?? null;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const accountId = await getAccountId();

  if (!accountId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const relativePath = params.path.join("/");

  // Ensure users can only access their own account storage tree
  const allowedPrefix = `accounts/${accountId}/`;
  if (!relativePath.startsWith(allowedPrefix)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  let absolutePath: string;
  try {
    absolutePath = resolveStoragePath(relativePath);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid path" },
      { status: 400 },
    );
  }

  try {
    const fileBuffer = await fs.readFile(absolutePath);
    const mimeType = getMimeType(absolutePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 },
      );
    }

    console.error("File download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load file" },
      { status: 500 },
    );
  }
}

