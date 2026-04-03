import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { pool } from "@/lib/db";

export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.userId;

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorised" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    await pool.execute(
      `UPDATE sponsor_match.user
       SET FirstName = ?, LastName = ?, Email = ?, Phone = ?
       WHERE UserId = ?`,
      [firstName, lastName, email, phone, userId],
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error: unknown) {
    console.error("Database Update Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
