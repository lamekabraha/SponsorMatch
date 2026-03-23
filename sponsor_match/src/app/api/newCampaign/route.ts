import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.name || !body?.goal || !body?.type) {
      return NextResponse.json(
        { success: false, error: "Missing required campaign fields" },
        { status: 400 }
      );
    }

    // Mock response for now. Replace with DB insert in next step.
    return NextResponse.json({
      success: true,
      message: "Campaign saved successfully",
      data: {
        campaignId: Date.now(),
        ...body,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }
}

