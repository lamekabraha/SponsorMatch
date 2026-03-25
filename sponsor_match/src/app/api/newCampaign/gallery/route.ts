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
    const files = formData.getAll("images") as File[];

    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "At least one image is required." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    const imagePaths: string[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      if (!file || file.size === 0) {
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Images must be JPG, PNG, or WEBP." },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: "Each image must be 5MB or smaller." },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueType = `CampaignGallery_${Date.now()}_${index}`;
      const path = await saveAccountFile(accountId, uniqueType, buffer, ext);
      imagePaths.push(path);
    }

    return NextResponse.json({
      success: true,
      imagePaths,
    });
  } catch (error) {
    console.error("Campaign gallery upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload campaign gallery images." },
      { status: 500 }
    );
  }
}

