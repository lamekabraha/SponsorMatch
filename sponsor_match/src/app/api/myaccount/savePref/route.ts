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

  const { preferredCategories, preferredBenefits } = await request.json();

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bus] = await connection.execute(
      "SELECT BusinessId FROM sponsor_match.business WHERE AccountId = ?",
      [accountId],
    );
    const businessId = (bus as { BusinessId?: number }[])[0]?.BusinessId;

    if (!businessId) throw new Error("Business profile not found");

    await connection.execute(
      "DELETE FROM sponsor_match.business_category_pref WHERE BusinessId = ?",
      [businessId],
    );
    if (preferredCategories.length > 0) {
      const catValues = preferredCategories.map((id: number) => [businessId, id]);
      await connection.query(
        "INSERT INTO sponsor_match.business_category_pref (BusinessId, VcseTypeId) VALUES ?",
        [catValues],
      );
    }

    await connection.execute(
      "DELETE FROM sponsor_match.business_benefit_pref WHERE BusinessId = ?",
      [businessId],
    );
    if (preferredBenefits.length > 0) {
      const benValues = preferredBenefits.map((id: number) => [businessId, id]);
      await connection.query(
        "INSERT INTO sponsor_match.business_benefit_pref (BusinessId, BenefitTypeId) VALUES ?",
        [benValues],
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true, message: "Preferences updated" });
  } catch (error: unknown) {
    await connection.rollback();
    console.error("Database Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update preferences";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    connection.release();
  }
}
