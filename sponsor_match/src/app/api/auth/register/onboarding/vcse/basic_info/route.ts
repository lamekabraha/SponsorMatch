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
        const { orgAddress, primaryFocusAreas, regNumber } = body;

        if (!orgAddress?.trim()) {
            return NextResponse.json(
                { error: "Organisation address is required" },
                { status: 400 }
            );
        }

        await connection.beginTransaction();

        // 1. Insert into vcse table
        await connection.execute(
            `INSERT INTO sponsor_match.vcse (AccountId, RegNumber) VALUES (?, ?)`,
            [accountId, regNumber?.trim() || null]
        );

        // 2. Insert into location table (organisation address)
        await connection.execute(
            `INSERT INTO sponsor_match.location (AccountId, Address) VALUES (?, ?)`,
            [accountId, orgAddress.trim()]
        );

        // 3. Update account IndustrySector if primaryFocusAreas provided (comma-separated)
        if (primaryFocusAreas && Array.isArray(primaryFocusAreas) && primaryFocusAreas.length > 0) {
            const industrySector = primaryFocusAreas.join(", ");
            await connection.execute(
                `UPDATE sponsor_match.account SET IndustrySector = ? WHERE AccountId = ?`,
                [industrySector, accountId]
            );
        }

        await connection.commit();

        return NextResponse.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error("VCSE basic info error:", error);
        return NextResponse.json(
            { error: "Failed to save basic information" },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}
