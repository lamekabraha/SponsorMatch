import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { pool } from "@/lib/db";
import { resolveStoragePath, toStorageRelativePath } from "@/lib/storage";

type CampaignPackageResponse = {
  packageType?: string;
  title: string;
  price: number;
  benefitLines?: string[];
};

type CampaignPreviewResponse = {
  name: string;
  orgName?: string;
  location?: string | null;
  type?: string;
  desc?: string;
  summary?: string;
  goal: number;
  raised?: number | null;
  coverImageUrl?: string | null;
  websiteUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  additionalImageUrls?: string[];
  packages?: CampaignPackageResponse[];
};

type MetaPayload = {
  summary?: string;
  desc?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
};

async function getAccountId(): Promise<number | null> {
  const session = await getServerSession(authConfig);
  return (session?.user as { accountId?: number })?.accountId ?? null;
}

async function hasMutualFollowing(a: number, b: number): Promise<boolean> {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS cnt
     FROM sponsor_match.following
     WHERE (AccountId = ? AND FollowId = ?)
        OR (AccountId = ? AND FollowId = ?)`,
    [a, b, b, a],
  );
  const cnt = Number((rows as { cnt?: unknown }[])[0]?.cnt ?? 0);
  return cnt === 2;
}

async function hasCompleteDonationToCampaign(
  donorAccountId: number,
  campaignId: number,
): Promise<boolean> {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS cnt
     FROM sponsor_match.donation
     WHERE Donor = ? AND CampaignId = ? AND PaymentStatus = 'complete'`,
    [donorAccountId, campaignId],
  );
  const cnt = Number((rows as { cnt?: unknown }[])[0]?.cnt ?? 0);
  return cnt > 0;
}

async function readCampaignMeta(
  ownerAccountId: number,
  campaignId: number,
): Promise<MetaPayload> {
  const rel = `accounts/${ownerAccountId}/Campaign/${campaignId}/meta.json`;
  try {
    const abs = resolveStoragePath(rel);
    const raw = await fs.readFile(abs, "utf8");
    return JSON.parse(raw) as MetaPayload;
  } catch {
    return {};
  }
}

async function listAdditionalImageUrls(folderRel: string): Promise<string[]> {
  const abs = resolveStoragePath(folderRel);
  try {
    const names = await fs.readdir(abs);
    const imageFiles = names
      .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return imageFiles.map((n) => `/api/files/${folderRel.replace(/\/+$/, "")}/${n}`);
  } catch {
    return [];
  }
}

function normalizeCoverUrl(coverImage: unknown): string {
  const coverRel = toStorageRelativePath(
    coverImage == null ? null : String(coverImage),
  );
  if (!coverRel) return "";
  // We rely on /api/files auth + route; if it 404s, the template still has fallback imagery.
  return `/api/files/${coverRel}`;
}

export async function GET(req: NextRequest) {
  const accountId = await getAccountId();
  if (!accountId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const campaignId = Number(
    req.nextUrl.searchParams.get("id") ?? req.nextUrl.searchParams.get("campaignId"),
  );
  if (!Number.isFinite(campaignId) || campaignId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid campaign id" }, { status: 400 });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
         c.CampaignId,
         c.CampaignName,
         c.CoverImage,
         c.GoalAmount,
         c.Status,
         c.AdditionalImagePath,
         c.AccountId,
         ct.Type,
         l.Address AS location,
         a.Name AS OrgName
       FROM campaign c
       INNER JOIN campaign_type ct ON ct.CampaignTypeId = c.CampaignTypeId
       LEFT JOIN location l ON l.AccountId = c.AccountId
       INNER JOIN account a ON a.AccountId = c.AccountId
       WHERE c.CampaignId = ?
       LIMIT 1`,
      [campaignId],
    );

    const row = (rows as Record<string, unknown>[])[0];
    if (!row) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const ownerAccountId = Number(row.AccountId);
    const isOwner = Number.isFinite(ownerAccountId) && ownerAccountId === accountId;
    const allowed =
      isOwner ||
      (Number.isFinite(ownerAccountId) &&
        (await hasMutualFollowing(accountId, ownerAccountId))) ||
      (await hasCompleteDonationToCampaign(accountId, campaignId));
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const coverImageUrl = normalizeCoverUrl(row.CoverImage);

    const [raisedRows] = await pool.execute(
      `SELECT COALESCE(SUM(d.Amount), 0) AS raised
       FROM sponsor_match.donation d
       WHERE d.CampaignId = ? AND d.PaymentStatus = 'complete'`,
      [campaignId],
    );
    const raised = Number(((raisedRows as { raised?: unknown }[])[0]?.raised ?? 0));

    const [pkgRows] = await pool.execute(
      `SELECT p.PackageId, p.Title, p.Price, pt.PackageType
       FROM package p
       INNER JOIN package_type pt ON pt.PackageTypeId = p.PackageType
       WHERE p.CampaignId = ?
       ORDER BY p.PackageId ASC`,
      [campaignId],
    );

    const pkgRaw = pkgRows as {
      PackageId: number;
      Title: string;
      Price: number;
      PackageType: string;
    }[];

    const packages: CampaignPackageResponse[] = [];
    for (const p of pkgRaw) {
      const [benefitRows] = await pool.execute(
        `SELECT b.BenefitId, b.Name
         FROM package_benefit pb
         INNER JOIN benefit b ON b.BenefitId = pb.BenefitId
         WHERE pb.PackageId = ?`,
        [p.PackageId],
      );
      const benefitNames = (benefitRows as { Name: string }[]).map((r) => r.Name);

      packages.push({
        packageType: p.PackageType,
        title: p.Title,
        price: Number(p.Price),
        benefitLines: benefitNames,
      });
    }

    // Additional images: prefer DB-provided folder (if present), else default folder under owner account.
    let additionalImageUrls: string[] = [];
    const additionalImagePath = row.AdditionalImagePath;
    if (typeof additionalImagePath === "string" && String(additionalImagePath).trim() !== "") {
      const folderRel =
        String(additionalImagePath).replace(/\\/g, "/").replace(/\/+$/, "") ||
        `accounts/${ownerAccountId}/Campaign/${campaignId}/AdditionalImages`;
      additionalImageUrls = await listAdditionalImageUrls(folderRel);
    } else {
      additionalImageUrls = await listAdditionalImageUrls(
        `accounts/${ownerAccountId}/Campaign/${campaignId}/AdditionalImages`,
      );
    }

    const meta = await readCampaignMeta(ownerAccountId, campaignId);

    const data: CampaignPreviewResponse = {
      name: String(row.CampaignName ?? ""),
      orgName: String(row.OrgName ?? ""),
      location: row.location == null ? null : String(row.location),
      type: String(row.Type ?? ""),
      goal: Number(row.GoalAmount ?? 0),
      raised,
      coverImageUrl,
      additionalImageUrls,
      packages,
      summary: meta.summary ?? "",
      desc: meta.desc ?? "",
      websiteUrl: meta.websiteUrl ?? "",
      instagramUrl: meta.instagramUrl ?? "",
      twitterUrl: meta.twitterUrl ?? "",
      facebookUrl: meta.facebookUrl ?? "",
      linkedinUrl: meta.linkedinUrl ?? "",
    };

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("[api/campaign] GET error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to load campaign" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const accountId = await getAccountId();
  if (!accountId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { campaignId?: number };
  try {
    body = (await req.json()) as { campaignId?: number };
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const campaignId = Number(body.campaignId);
  if (!Number.isFinite(campaignId) || campaignId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid campaign id" }, { status: 400 });
  }

  try {
    const [res] = await pool.execute(
      `UPDATE sponsor_match.campaign
       SET Status = 'closed'
       WHERE CampaignId = ? AND AccountId = ?`,
      [campaignId, accountId],
    );

    return NextResponse.json({
      success: true,
      message: "Campaign closed.",
      affectedRows: (res as any)?.affectedRows ?? 0,
    });
  } catch (e) {
    console.error("[api/campaign] PATCH error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to close campaign" },
      { status: 500 },
    );
  }
}

