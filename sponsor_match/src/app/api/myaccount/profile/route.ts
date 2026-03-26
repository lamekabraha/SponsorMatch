import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";

type MyAccountProfileResponse = {
  account: {
    AccountId: number;
    Name: string;
    AccountTypeId: number;
    IndustrySector: string | null;
    CompanySize: string | null;
    ContactName: string | null;
    ContactEmail: string | null;
    ContactPhone: string | null;
    Website: string | null;
    Instagram: string | null;
    Twitter: string | null;
    Facebook: string | null;
    LinkedIn: string | null;
    CompanyLogo: string | null;
    CompanyCover: string | null;
    Address: string | null;
    Description: string | null;
  };
  business: {
    IndustryType: string | null;
    PartnershipPref: string | null;
    AnnualBudget: number | null;
  } | null;
  vcse: {
    VcseType: string | null;
    VerificationDoc: string | null;
  } | null;
};

async function getAccountId(): Promise<number | null> {
  const session = await getServerSession(authConfig);
  return (session?.user as { accountId?: number })?.accountId ?? null;
}

export async function GET() {
  const accountId = await getAccountId();
  if (!accountId) {
    return NextResponse.json(
      { success: false, error: "Unauthorised" },
      { status: 401 },
    );
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
         a.AccountId,
         a.Name,
         a.AccountTypeId,
         a.IndustrySector,
         a.CompanySize,
         a.ContactName,
         a.ContactEmail,
         a.ContactPhone,
         a.Website,
         a.Instagram,
         a.Twitter,
         a.Facebook,
         a.Linkedin AS LinkedIn,
         a.CompanyLogo,
         a.CompanyCover,
         a.Description,
         addr.Address,
         b.PartnershipPref,
         it.IndustryType,
         b.\`AnnualBudget (£)\` AS AnnualBudget,
         v.VcseTypeId,
         vt.VcseType,
         v.VerificationDoc
       FROM sponsor_match.account a
       LEFT JOIN (
         SELECT AccountId, MIN(Address) AS Address
         FROM sponsor_match.location
         GROUP BY AccountId
       ) addr
         ON addr.AccountId = a.AccountId
       LEFT JOIN sponsor_match.business b
         ON b.AccountId = a.AccountId
       LEFT JOIN sponsor_match.industry_type it
         ON it.IndustryId = b.IndustryId
       LEFT JOIN (
         SELECT AccountId,
                MAX(VcseTypeId) AS VcseTypeId,
                MAX(VerificationDoc) AS VerificationDoc
         FROM sponsor_match.vcse
         GROUP BY AccountId
       ) v
         ON v.AccountId = a.AccountId
       LEFT JOIN sponsor_match.vcse_type vt
         ON vt.VcseTypeId = v.VcseTypeId
       WHERE a.AccountId = ?
       LIMIT 1`,
      [accountId],
    );

    const row = (rows as any[])[0] as any | undefined;
    if (!row) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 },
      );
    }

    const account: MyAccountProfileResponse["account"] = {
      AccountId: Number(row.AccountId),
      Name: String(row.Name ?? ""),
      AccountTypeId: Number(row.AccountTypeId),
      IndustrySector: row.IndustrySector ?? null,
      CompanySize: row.CompanySize ?? null,
      ContactName: row.ContactName ?? null,
      ContactEmail: row.ContactEmail ?? null,
      ContactPhone: row.ContactPhone ?? null,
      Website: row.Website ?? null,
      Instagram: row.Instagram ?? null,
      Twitter: row.Twitter ?? null,
      Facebook: row.Facebook ?? null,
      LinkedIn: row.LinkedIn ?? null,
      CompanyLogo: row.CompanyLogo ?? null,
      CompanyCover: row.CompanyCover ?? null,
      Address: row.Address ?? null,
      Description: row.Description ?? null,
    };

    const business =
      row.PartnershipPref != null || row.AnnualBudget != null || row.IndustryType != null
        ? {
            IndustryType: row.IndustryType ?? null,
            PartnershipPref: row.PartnershipPref ?? null,
            AnnualBudget:
              row.AnnualBudget != null ? Number(row.AnnualBudget) : null,
          }
        : null;

    const vcse =
      row.VcseType != null || row.VerificationDoc != null
        ? {
            VcseType: row.VcseType ?? null,
            VerificationDoc: row.VerificationDoc ?? null,
          }
        : null;

    const data: MyAccountProfileResponse = {
      account,
      business,
      vcse,
    };

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("[api/myaccount/profile]", e);
    return NextResponse.json(
      { success: false, error: "Failed to load account profile" },
      { status: 500 },
    );
  }
}

function toNullableString(value: unknown): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

export async function PATCH(req: Request) {
  const accountId = await getAccountId();
  if (!accountId) {
    return NextResponse.json(
      { success: false, error: "Unauthorised" },
      { status: 401 },
    );
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
    businessSector?: string; // business.IndustryType
    vcseType?: string; // vcse_type.VcseType
  };

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const description = toNullableString(body.description);
  const email = toNullableString(body.email);
  const phone = toNullableString(body.phone);
  const website = toNullableString(body.website);
  const instagram = toNullableString(body.instagram);
  const twitter = toNullableString(body.twitter);
  const facebook = toNullableString(body.facebook);
  const linkedIn = toNullableString(body.linkedIn);

  if (!name) {
    return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
  }

  try {
    // Determine role so we update the correct role-specific table.
    const [typeRows] = await pool.execute(
      `SELECT AccountTypeId FROM sponsor_match.account WHERE AccountId = ? LIMIT 1`,
      [accountId],
    );
    const accountTypeId = Number((typeRows as { AccountTypeId?: number }[])[0]?.AccountTypeId ?? 0);
    if (![1, 2].includes(accountTypeId)) {
      return NextResponse.json({ success: false, error: "Unsupported account role" }, { status: 400 });
    }

    await pool.execute(
      `UPDATE sponsor_match.account
       SET Name = ?, Description = ?, ContactEmail = ?, ContactPhone = ?, Website = ?, Instagram = ?, Twitter = ?, Facebook = ?, LinkedIn = ?
       WHERE AccountId = ?`,
      [name, description, email, phone, website, instagram, twitter, facebook, linkedIn, accountId],
    );

    if (accountTypeId === 1) {
      const sector = toNullableString(body.businessSector);
      if (sector) {
        const [industryRows] = await pool.execute(
          `SELECT IndustryId FROM sponsor_match.industry_type WHERE IndustryType = ? LIMIT 1`,
          [sector],
        );
        const industryId = (industryRows as { IndustryId?: number }[])[0]?.IndustryId;
        if (!industryId) {
          return NextResponse.json({ success: false, error: "Invalid Business Sector" }, { status: 400 });
        }

        // Update if row exists; otherwise insert minimal row.
        const [updRows] = await pool.execute(
          `UPDATE sponsor_match.business SET IndustryId = ? WHERE AccountId = ?`,
          [industryId, accountId],
        );
        const affected = Number((updRows as any)?.affectedRows ?? 0);
        if (affected === 0) {
          await pool.execute(
            `INSERT INTO sponsor_match.business (AccountId, IndustryId, PartnershipPref, \`AnnualBudget (£)\`)
             VALUES (?, ?, NULL, NULL)`,
            [accountId, industryId],
          );
        }
      }
    } else if (accountTypeId === 2) {
      const vcseType = toNullableString(body.vcseType);
      if (vcseType) {
        const [vcseTypeRows] = await pool.execute(
          `SELECT VcseTypeId FROM sponsor_match.vcse_type WHERE VcseType = ? LIMIT 1`,
          [vcseType],
        );
        const vcseTypeId = (vcseTypeRows as { VcseTypeId?: number }[])[0]?.VcseTypeId;
        if (!vcseTypeId) {
          return NextResponse.json({ success: false, error: "Invalid VCSE Type" }, { status: 400 });
        }

        const [updRows] = await pool.execute(
          `UPDATE sponsor_match.vcse SET VcseTypeId = ? WHERE AccountId = ?`,
          [vcseTypeId, accountId],
        );
        const affected = Number((updRows as any)?.affectedRows ?? 0);
        if (affected === 0) {
          await pool.execute(
            `INSERT INTO sponsor_match.vcse (AccountId, VcseTypeId, VerificationDoc) VALUES (?, ?, NULL)`,
            [accountId, vcseTypeId],
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: "Account updated." });
  } catch (e) {
    console.error("[api/myaccount/profile] PATCH error:", e);
    return NextResponse.json({ success: false, error: "Failed to update account" }, { status: 500 });
  }
}

