import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { pool } from "@/lib/db";
import { saveAccountFile } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const accountId = (session?.user as { accountId?: number })?.accountId;

    if (!session || !accountId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const logoFile = formData.get("logo") as File | null;

    if (!logoFile || logoFile.size === 0) {
      return NextResponse.json(
        { success: false, error: "Logo file is required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(logoFile.type)) {
      return NextResponse.json(
        { success: false, error: "Logo must be JPG, PNG, or WebP" },
        { status: 400 },
      );
    }

    const logoExt = logoFile.name.split(".").pop()?.toLowerCase() || "png";
    const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
    const logoPath = await saveAccountFile(accountId, "logo", logoBuffer, logoExt);

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const logoUrl = `${baseUrl}/api/storage/${logoPath}`;

    await pool.execute(
      `UPDATE sponsor_match.account SET CompanyLogo = ? WHERE AccountId = ?`,
      [logoUrl, accountId],
    );

    return NextResponse.json({ success: true, logoUrl });
  } catch (error) {
    console.error("My account logo upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload logo" },
      { status: 500 },
    );
  }
}
