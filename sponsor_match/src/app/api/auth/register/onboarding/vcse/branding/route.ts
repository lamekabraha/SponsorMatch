import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import { authConfig } from "@/lib/auth-config";
import { saveAccountFile } from "@/lib/storage";

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
    const logoFile = formData.get("logo") as File | null;
    const coverFile = formData.get("cover") as File | null;

    if (!logoFile || logoFile.size === 0) {
      return NextResponse.json(
        { error: "Organisation logo is required" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    const logoExt = logoFile.name.split(".").pop()?.toLowerCase() || "png";
    const coverExt = coverFile
      ? (coverFile.name.split(".").pop()?.toLowerCase() || "png")
      : null;

    if (!allowedTypes.includes(logoFile.type)) {
      return NextResponse.json(
        { error: "Logo must be JPG or PNG" },
        { status: 400 }
      );
    }
    if (
      coverFile &&
      coverFile.size > 0 &&
      !allowedTypes.includes(coverFile.type)
    ) {
      return NextResponse.json(
        { error: "Cover image must be JPG or PNG" },
        { status: 400 }
      );
    }

    const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
    const logoPath = await saveAccountFile(
      accountId,
      "logo",
      logoBuffer,
      logoExt
    );

    let coverPath: string | null = null;
    if (coverFile && coverFile.size > 0 && coverExt) {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      coverPath = await saveAccountFile(
        accountId,
        "cover",
        coverBuffer,
        coverExt
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const logoUrl = `${baseUrl}/api/storage/${logoPath}`;
    const coverUrl = coverPath ? `${baseUrl}/api/storage/${coverPath}` : null;

    await pool.execute(
      `UPDATE sponsor_match.account SET CompanyLogo = ?, CompanyCover = ? WHERE AccountId = ?`,
      [logoUrl, coverUrl, accountId]
    );

    return NextResponse.json({
      success: true,
      logoUrl,
      coverUrl,
    });
  } catch (error) {
    console.error("Branding upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload branding images" },
      { status: 500 }
    );
  }
}
