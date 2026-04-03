import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { pool } from "@/lib/db";

export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);
  const accountId = session?.user?.accountId;

  if (!accountId) {
    return NextResponse.json(
      { success: false, error: "Unauthorised" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { address, website, instagram, twitter, facebook, linkedIn } = body;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        `UPDATE sponsor_match.account
         SET Website = ?, Instagram = ?, Twitter = ?, Facebook = ?, LinkedIn = ?
         WHERE AccountId = ?`,
        [website, instagram, twitter, facebook, linkedIn ?? null, accountId],
      );

      await connection.execute(
        `UPDATE sponsor_match.location
         SET Address = ?
         WHERE AccountId = ?`,
        [address, accountId],
      );

      await connection.commit();
      return NextResponse.json({
        success: true,
        message: "Identity updated successfully",
      });
    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }
  } catch (error: unknown) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
