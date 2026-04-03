import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

export async function PATCH(request: Request) {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, repeatPassword } = await request.json();

    if (!currentPassword || !newPassword || !repeatPassword) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (newPassword !== repeatPassword) {
      return NextResponse.json({ success: false, error: "New passwords do not match" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const [rows]: any = await pool.execute(
      "SELECT HashedPassword FROM sponsor_match.user WHERE UserId = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const hashedDbPassword = rows[0].HashedPassword;

    const isMatch = await bcrypt.compare(currentPassword, hashedDbPassword);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.execute(
      "UPDATE sponsor_match.user SET HashedPassword = ? WHERE UserId = ?",
      [newHashedPassword, userId]
    );

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Change Password API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
