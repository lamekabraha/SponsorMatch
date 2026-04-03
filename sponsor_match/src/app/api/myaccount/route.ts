import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config"; // Ensure this path matches your project
import { pool } from "@/lib/db";

async function getSession() {
  return getServerSession(authConfig);
}

// Helper: Fetch User Data (Returns the raw data or null)
async function fetchUserDetail(userId: number) {
  const [rows] = await pool.execute(
    `SELECT UserId, FirstName, LastName, Email AS UserEmail, Phone AS UserPhone
     FROM user
     WHERE UserId = ?`,
    [userId],
  );
  return (rows as any[])[0];
}

// Helper: Fetch Account Data (Returns the raw data or null)
async function fetchAccountDetail(accountId: number) {
  const [rows] = await pool.execute(
    `SELECT a.Name, t.AccountType, a.Description, a.CompanyLogo as logo, l.Address, a.Website, a.Instagram, a.Twitter, a.Facebook
     FROM account a
     INNER JOIN account_type t ON a.AccountTypeId = t.AccountTypeId
     INNER JOIN location l ON a.AccountId = l.AccountId
     WHERE a.AccountId = ?`,
    [accountId]
  );
  return (rows as any[])[0];
}

// THE MAIN ROUTE HANDLER
export async function GET() {
  const session = await getSession();
  
  // Use the custom properties we added to your NextAuth types earlier
  const userId = session?.user?.id;
  const accountId = session?.user?.accountId;

  if (!userId || !accountId) {
    return NextResponse.json({ success: false, error: "Unauthorised"}, { status: 401 });
  }

  try {
    // Run both queries in parallel for better performance
    const [userData, accountData] = await Promise.all([
      fetchUserDetail(userId),
      fetchAccountDetail(accountId)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        profile: userData,
        account: accountData
      }
    });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};