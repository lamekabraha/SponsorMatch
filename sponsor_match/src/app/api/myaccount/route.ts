import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

function toValidId(value: unknown): string | number | null {
    if (value == null) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
    return null;
}

async function getSession(): Promise<any> {
    return getServerSession(authConfig);
}

async function getProfileData(userId: string | number): Promise<any[]> {
    const [rows] = await pool.execute(
        `SELECT
            u.UserId,
            u.AccountId,
            u.Email AS UserEmail,
            u.FirstName,
            u.LastName,
            a.AccountTypeId,
            a.IndustrySector,
            a.ContactName,
            COALESCE(a.ContactEmail, u.Email) AS ContactEmail,
            a.ContactPhone
         FROM sponsor_match.user u
         INNER JOIN sponsor_match.account a ON a.AccountId = u.AccountId
         WHERE u.UserId = ?
         LIMIT 1`,
        [userId]
    );
    return rows as any[];
}

async function getBusinessData(accountId: string | number): Promise<any[]> {
    const [rows] = await pool.execute(
        `SELECT CompanyLogo, Description, Website, Instagram, Twitter, Facebook, LinkedIn
         FROM sponsor_match.account
         WHERE AccountId = ?`,
        [accountId]
    );
    return rows as any[];
}

function toNullableString(value: unknown): string | null {
    const str = String(value ?? "").trim();
    return str.length > 0 ? str : null;
}

type PatchBody = {
    name?: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedIn?: string;
};

export async function GET() {
    const session = await getSession();
    const accountId = toValidId(session?.user?.accountId ?? session?.user?.AccountId);
    const userId = toValidId(session?.user?.userId ?? session?.user?.id ?? session?.user?.UserId);

    if (!accountId || !userId) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const [profileData, businessData] = await Promise.all([
        getProfileData(userId),
        getBusinessData(accountId),
    ]);

    return NextResponse.json({
        success: true,
        data: { profile: profileData, business: businessData },
    });
}

export async function PATCH(req: Request) {
    const session = await getSession();
    const accountId = toValidId(session?.user?.accountId ?? session?.user?.AccountId);
    const userId = toValidId(session?.user?.userId ?? session?.user?.id ?? session?.user?.UserId);

    if (!accountId || !userId) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    let body: PatchBody;
    try {
        body = (await req.json()) as PatchBody;
    } catch {
        return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const name = String(body.name ?? "").trim();
    if (!name) {
        return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const description = toNullableString(body.description);
    const email = toNullableString(body.email);
    const phone = toNullableString(body.phone);
    const website = toNullableString(body.website);
    const instagram = toNullableString(body.instagram);
    const twitter = toNullableString(body.twitter);
    const facebook = toNullableString(body.facebook);
    const linkedIn = toNullableString(body.linkedIn);

    try {
        await pool.execute(
            `UPDATE sponsor_match.account
             SET Name = ?,
                 Description = ?,
                 ContactEmail = ?,
                 ContactPhone = ?,
                 Website = ?,
                 Instagram = ?,
                 Twitter = ?,
                 Facebook = ?,
                 LinkedIn = ?
             WHERE AccountId = ?`,
            [name, description, email, phone, website, instagram, twitter, facebook, linkedIn, accountId]
        );

        if (email) {
            await pool.execute(
                `UPDATE sponsor_match.user SET Email = ? WHERE UserId = ?`,
                [email, userId]
            );
        }

        return NextResponse.json({ success: true, message: "Account updated." });
    } catch (e) {
        console.error("[api/myAccount] PATCH error:", e);
        return NextResponse.json(
            { success: false, error: "Failed to update account" },
            { status: 500 }
        );
    }
}