import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { pool } from "@/lib/db";
import { authConfig } from "@/lib/auth-config";

export async function POST(req: Request) {
    const connection = await pool.getConnection();

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
        const { companyAddress, industry, companySize, website } = body;

        if (!companyAddress?.trim()) {
            return NextResponse.json(
                { error: "Company address is required" },
                { status: 400 }
            );
        }

        if (!industry?.trim()) {
            return NextResponse.json(
                { error: "Industry is required" },
                { status: 400 }
            );
        }

        if (!companySize?.trim()) {
            return NextResponse.json(
                { error: "Company size is required" },
                { status: 400 }
            );
        }

        await connection.beginTransaction();

        // 1. Insert into location table (company address)
        await connection.execute(
            `INSERT INTO sponsor_match.location (AccountId, Address) VALUES (?, ?)`,
            [accountId, companyAddress.trim()]
        );

        // 2. Update account with IndustrySector, CompanySize, Website
        await connection.execute(
            `UPDATE sponsor_match.account 
             SET IndustrySector = ?, CompanySize = ?, Website = ? 
             WHERE AccountId = ?`,
            [
                industry.trim(),
                companySize.trim(),
                website?.trim() || null,
                accountId,
            ]
        );

        await connection.commit();

        return NextResponse.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error("Business basic info error:", error);
        return NextResponse.json(
            { error: "Failed to save basic information" },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}
