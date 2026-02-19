import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import { authConfig } from "@/lib/auth-config";
import { saveAccountFile } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const accountId = (session?.user as { accountId?: number })?.accountId;

    if (!session || !accountId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const docFile = formData.get("verificationDoc") as File | null;

    if (!docFile || docFile.size === 0) {
      return NextResponse.json(
        { error: "Verification document is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(docFile.type)) {
      return NextResponse.json(
        { error: "Document must be JPG, PNG, or PDF" },
        { status: 400 }
      );
    }

    const ext =
      docFile.name.split(".").pop()?.toLowerCase() ||
      (docFile.type === "application/pdf" ? "pdf" : "png");

    const buffer = Buffer.from(await docFile.arrayBuffer());
    const relativePath = await saveAccountFile(
      accountId,
      "verification",
      buffer,
      ext
    );

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const docUrl = `${baseUrl}/api/storage/${relativePath}`;

    await pool.execute(
      `UPDATE sponsor_match.vcse SET VerificationDoc = ? WHERE AccountId = ?`,
      [docUrl, accountId]
    );

    return NextResponse.json({ success: true, docUrl });
  } catch (error) {
    console.error("Verification upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload verification document" },
      { status: 500 }
    );
  }
}
