import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { saveAccountFile } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const accountId = (session?.user as { accountId?: number })?.accountId;

    if (!session || !accountId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const coverFile = formData.get("cover") as File | null;

    if (!coverFile || coverFile.size === 0) {
      return NextResponse.json(
        { success: false, error: "Cover image file is required." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(coverFile.type)) {
      return NextResponse.json(
        { success: false, error: "Cover image must be JPG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (coverFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Cover image must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const ext = coverFile.name.split(".").pop()?.toLowerCase() || "png";
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const coverPath = await saveAccountFile(accountId, "CampaignCover", buffer, ext);

    return NextResponse.json({
      success: true,
      coverPath,
    });
  } catch (error) {
    console.error("Campaign cover upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload campaign cover image." },
      { status: 500 }
    );
  }
}

