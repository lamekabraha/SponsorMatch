import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import { authConfig } from "@/lib/auth-config";

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

    const body = await req.json();
    const { contactName, contactEmail, contactPhone, additionalAdmins } = body;

    if (!contactName?.trim()) {
      return NextResponse.json(
        { error: "Primary contact name is required" },
        { status: 400 }
      );
    }

    if (!contactEmail?.trim()) {
      return NextResponse.json(
        { error: "Contact email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid contact email" },
        { status: 400 }
      );
    }

    if (!contactPhone?.trim()) {
      return NextResponse.json(
        { error: "Contact phone is required" },
        { status: 400 }
      );
    }

    const additionalAdminsStr =
      additionalAdmins && typeof additionalAdmins === "string"
        ? additionalAdmins.trim()
        : null;

    await pool.execute(
      `UPDATE sponsor_match.account 
       SET ContactEmail = ?, ContactName = ?, ContactPhone = ?, AdditionalAdmins = ? 
       WHERE AccountId = ?`,
      [
        contactEmail.trim().toLowerCase(),
        contactName.trim(),
        contactPhone.trim(),
        additionalAdminsStr || null,
        accountId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact save error:", error);
    return NextResponse.json(
      { error: "Failed to save contact information" },
      { status: 500 }
    );
  }
}
