// This API route handles POST requests for uploading a campaign cover image.
// The core logic performs several main tasks:
// 1. Authenticates the user using NextAuth and ensures an accountId is present.
// 2. Retrieves the uploaded file from the incoming FormData request under the key "cover".
// 3. Validates the uploaded file to ensure:
//    - A file was actually provided and is not empty.
//    - The file is of an allowed type (JPG, PNG, or WEBP).
//    - The file size does not exceed 5MB.
// 4. Processes the file by extracting its extension, converting the file into a Node.js Buffer, and then
//    saving it using a helper `saveAccountFile` which likely uploads the image to storage for the user's account.
// 5. If successful, returns a JSON response containing the file path. 
//    If there is an error at any step, returns an appropriate error message and HTTP status.

// Imports for route handling, authentication, file storage, and working with server Responses.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { saveAccountFile } from "@/lib/storage";

// Handles POST requests to this route
export async function POST(req: Request) {
  try {
    // Get the user's session and accountId using NextAuth
    const session = await getServerSession(authConfig);
    const accountId = (session?.user as { accountId?: number })?.accountId;

    // If user isn't logged in or doesn't have an accountId, reject the request
    if (!session || !accountId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Parse the FormData to get the cover image file
    const formData = await req.formData();
    const coverFile = formData.get("cover") as File | null;

    // Validate that a file exists and is not empty
    if (!coverFile || coverFile.size === 0) {
      return NextResponse.json(
        { success: false, error: "Cover image file is required." },
        { status: 400 }
      );
    }

    // Check file type is JPG, PNG, or WEBP
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(coverFile.type)) {
      return NextResponse.json(
        { success: false, error: "Cover image must be JPG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    // Check file size (must not exceed 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (coverFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Cover image must be 5MB or smaller." },
        { status: 400 }
      );
    }

    // Extract file extension, with a fallback to 'png'
    const ext = coverFile.name.split(".").pop()?.toLowerCase() || "png";
    // Read file as a Buffer suitable for Node.js storage APIs
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    // Save file and get the public path/url
    const coverPath = await saveAccountFile(accountId, "CampaignCover", buffer, ext);

    // Respond with success and the uploaded file's path
    return NextResponse.json({
      success: true,
      coverPath,
    });
  } catch (error) {
    // Log error and respond with failure
    console.error("Campaign cover upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload campaign cover image." },
      { status: 500 }
    );
  }
}
