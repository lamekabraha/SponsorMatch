import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { pool } from "@/lib/db";
import { resolveStoragePath, toStorageRelativePath } from "@/lib/storage";
import fs from "fs/promises";
import path from "path";

async function getAccountId(): Promise<number | null> {
  const session = await getServerSession(authConfig);
  return (session?.user as { accountId?: number })?.accountId ?? null;
}

type CampaignMeta = {
  summary?: string;
  desc?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
};

type EditPayload = {
  campaignId: number;
  name: string;
  type: string;
  goal: number;
  desc?: string;
  summary?: string;
  coverImageUrl?: string;
  additionalImageUrls?: string[];
  websiteUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  packages?: Array<{
    packageType: string;
    title: string;
    price: number;
    benefitIds?: number[];
  }>;
};

async function buildCampaignCoverPath(
  accountId: number,
  campaignId: number,
  sourceRelativePath: string | null
): Promise<string | null> {
  if (!sourceRelativePath) return null;

  const sourceAbsolutePath = resolveStoragePath(sourceRelativePath);
  const ext = path.extname(sourceRelativePath).replace(".", "").toLowerCase() || "jpg";
  const targetRelativePath = `accounts/${accountId}/Campaign/${campaignId}/Cover.${ext}`;
  const targetAbsolutePath = resolveStoragePath(targetRelativePath);

  await fs.mkdir(path.dirname(targetAbsolutePath), { recursive: true });
  await fs.copyFile(sourceAbsolutePath, targetAbsolutePath);

  return targetRelativePath;
}

function getAdditionalImagesFolderRel(accountId: number, campaignId: number): string {
  return `accounts/${accountId}/Campaign/${campaignId}/AdditionalImages`;
}

function metaRelativePath(accountId: number, campaignId: number): string {
  return `accounts/${accountId}/Campaign/${campaignId}/meta.json`;
}

async function readCampaignMeta(accountId: number, campaignId: number): Promise<CampaignMeta> {
  const rel = metaRelativePath(accountId, campaignId);
  try {
    const raw = await fs.readFile(resolveStoragePath(rel), "utf8");
    return JSON.parse(raw) as CampaignMeta;
  } catch {
    return {};
  }
}

async function writeCampaignMeta(accountId: number, campaignId: number, meta: CampaignMeta): Promise<void> {
  const rel = metaRelativePath(accountId, campaignId);
  const abs = resolveStoragePath(rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, JSON.stringify(meta, null, 2), "utf8");
}

async function listAdditionalImageUrls(folderRel: string): Promise<string[]> {
  const abs = resolveStoragePath(folderRel);
  let names: string[] = [];
  try {
    names = await fs.readdir(abs);
  } catch {
    return [];
  }
  const imageFiles = names
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return imageFiles.map((n) => `/api/files/${folderRel.replace(/\/+$/, "")}/${n}`);
}

function normalizeToRelativeFromClientUrl(value: string): string | null {
  const trimmed = String(value).trim().replace(/^\/api\/files\/+/, "");
  return toStorageRelativePath(trimmed);
}

/**
 * Rebuilds AdditionalImages from the ordered list of client URLs/paths.
 * Sources may be existing campaign images or freshly uploaded temp files under accounts/...
 */
async function rebuildAdditionalImages(
  accountId: number,
  campaignId: number,
  sourceUrls: string[] | undefined
): Promise<{ folderRel: string | null; paths: string[] }> {
  const rels = (sourceUrls ?? [])
    .map((u) => normalizeToClientRelative(u))
    .filter((r): r is string => Boolean(r));

  if (rels.length === 0) {
    const folderRel = getAdditionalImagesFolderRel(accountId, campaignId);
    try {
      await fs.rm(resolveStoragePath(folderRel), { recursive: true, force: true });
    } catch {
      // ignore
    }
    return { folderRel: null, paths: [] };
  }

  const campaignBaseAbs = resolveStoragePath(`accounts/${accountId}/Campaign/${campaignId}`);
  const stagingAbs = path.join(campaignBaseAbs, `_gallery_staging_${Date.now()}`);
  await fs.mkdir(stagingAbs, { recursive: true });

  for (let i = 0; i < rels.length; i++) {
    const srcRel = rels[i];
    const srcAbs = resolveStoragePath(srcRel);
    const ext = path.extname(srcRel).replace(".", "").toLowerCase() || "jpg";
    const destName = `Image_${i + 1}.${ext}`;
    const destAbs = path.join(stagingAbs, destName);
    await fs.copyFile(srcAbs, destAbs);

    const inThisCampaignGallery = srcRel.startsWith(
      `${getAdditionalImagesFolderRel(accountId, campaignId)}/`
    );
    if (!inThisCampaignGallery) {
      try {
        await fs.unlink(srcAbs);
      } catch {
        // non-fatal
      }
    }
  }

  const finalRel = getAdditionalImagesFolderRel(accountId, campaignId);
  const finalAbs = resolveStoragePath(finalRel);
  try {
    await fs.rm(finalAbs, { recursive: true, force: true });
  } catch {
    // ignore
  }
  await fs.rename(stagingAbs, finalAbs);

  const finalPaths: string[] = [];
  for (let i = 0; i < rels.length; i++) {
    const ext = path.extname(rels[i]).replace(".", "").toLowerCase() || "jpg";
    finalPaths.push(`${finalRel}/Image_${i + 1}.${ext}`);
  }

  return { folderRel: finalRel, paths: finalPaths };
}

function normalizeToClientRelative(value: string): string | null {
  return normalizeToRelativeFromClientUrl(value);
}

async function finalizeCoverForUpdate(
  accountId: number,
  campaignId: number,
  rawCoverValue: string | undefined
): Promise<string | null> {
  const trimmed = String(rawCoverValue ?? "").trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/^\/api\/files\/+/, "");
  const rel = toStorageRelativePath(normalized);
  if (!rel) return null;

  const campaignPrefix = `accounts/${accountId}/Campaign/${campaignId}/`;
  if (rel.startsWith(campaignPrefix) && /\/Cover\.[^/]+$/i.test(rel)) {
    try {
      await fs.access(resolveStoragePath(rel));
      return rel;
    } catch {
      return null;
    }
  }

  return buildCampaignCoverPath(accountId, campaignId, rel);
}

export async function GET(req: NextRequest) {
  const accountId = await getAccountId();
  if (!accountId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const campaignId = Number(req.nextUrl.searchParams.get("campaignId") ?? req.nextUrl.searchParams.get("id"));
  if (!Number.isFinite(campaignId) || campaignId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid campaign id" }, { status: 400 });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT c.CampaignId, c.CampaignName, c.CampaignTypeId, c.CoverImage, c.GoalAmount, c.Status,
              c.AdditionalImagePath, t.Type
       FROM campaign c
       INNER JOIN campaign_type t ON t.CampaignTypeId = c.CampaignTypeId
       WHERE c.CampaignId = ? AND c.AccountId = ?
       LIMIT 1`,
      [campaignId, accountId]
    );
    const row = (rows as Record<string, unknown>[])[0];
    if (!row) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const coverRel = toStorageRelativePath(String(row.CoverImage ?? ""));
    const coverImageUrl =
      coverRel && (await fs.access(resolveStoragePath(coverRel)).then(() => true).catch(() => false))
        ? `/api/files/${coverRel}`
        : "";

    const folderRel =
      typeof row.AdditionalImagePath === "string" && String(row.AdditionalImagePath).trim() !== ""
        ? String(row.AdditionalImagePath).replace(/\\/g, "/").replace(/\/+$/, "")
        : getAdditionalImagesFolderRel(accountId, campaignId);

    let additionalImageUrls: string[] = [];
    try {
      additionalImageUrls = await listAdditionalImageUrls(folderRel);
    } catch {
      additionalImageUrls = [];
    }

    const [pkgRows] = await pool.execute(
      `SELECT p.PackageId, p.Title, p.Price, pt.PackageType
       FROM package p
       INNER JOIN package_type pt ON pt.PackageTypeId = p.PackageType
       WHERE p.CampaignId = ?
       ORDER BY p.PackageId ASC`,
      [campaignId]
    );

    const packagesRaw = pkgRows as {
      PackageId: number;
      Title: string;
      Price: number;
      PackageType: string;
    }[];

    const packages = await Promise.all(
      packagesRaw.map(async (p) => {
        const [bRows] = await pool.execute(
          `SELECT BenefitId FROM package_benefit WHERE PackageId = ?`,
          [p.PackageId]
        );
        const benefitIds = (bRows as { BenefitId: number }[]).map((b) => b.BenefitId);
        return {
          packageType: p.PackageType,
          title: p.Title,
          price: Number(p.Price),
          benefitIds,
        };
      })
    );

    const meta = await readCampaignMeta(accountId, campaignId);

    return NextResponse.json({
      success: true,
      data: {
        campaignId: Number(row.CampaignId),
        name: row.CampaignName,
        type: row.Type,
        goal: Number(row.GoalAmount ?? 0),
        status: row.Status,
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
      },
    });
  } catch (e) {
    console.error("editcampaign GET error:", e);
    return NextResponse.json({ success: false, error: "Failed to load campaign" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const accountId = await getAccountId();
  if (!accountId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<EditPayload>;
  try {
    body = (await req.json()) as Partial<EditPayload>;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const campaignId = Number(body.campaignId);
  if (!Number.isFinite(campaignId) || campaignId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid campaign id" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.type?.trim() || body.goal == null || !body.desc?.trim()) {
    return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
  }

  const connection = await pool.getConnection();

  try {
    const [ownRows] = await connection.execute(
      `SELECT CampaignId FROM campaign WHERE CampaignId = ? AND AccountId = ? LIMIT 1`,
      [campaignId, accountId]
    );
    if (!(ownRows as { CampaignId: number }[])[0]) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const [typeRows] = await connection.execute(
      `SELECT CampaignTypeId FROM campaign_type WHERE Type = ? LIMIT 1`,
      [String(body.type).trim()]
    );
    const campaignTypeId = (typeRows as { CampaignTypeId: number }[])[0]?.CampaignTypeId;
    if (!campaignTypeId) {
      return NextResponse.json({ success: false, error: "Invalid campaign type." }, { status: 400 });
    }

    const finalCoverPath = await finalizeCoverForUpdate(
      accountId,
      campaignId,
      body.coverImageUrl
    );

    const { folderRel } = await rebuildAdditionalImages(
      accountId,
      campaignId,
      body.additionalImageUrls
    );

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE campaign
       SET CampaignName = ?, CampaignTypeId = ?, GoalAmount = ?,
           CoverImage = COALESCE(?, CoverImage),
           AdditionalImagePath = ?
       WHERE CampaignId = ? AND AccountId = ?`,
      [
        String(body.name).trim(),
        campaignTypeId,
        Number(body.goal),
        finalCoverPath,
        folderRel,
        campaignId,
        accountId,
      ]
    );

    const [existingPkg] = await connection.execute(
      `SELECT PackageId FROM package WHERE CampaignId = ?`,
      [campaignId]
    );
    const existingIds = (existingPkg as { PackageId: number }[]).map((r) => r.PackageId);
    if (existingIds.length > 0) {
      const placeholders = existingIds.map(() => "?").join(",");
      await connection.execute(`DELETE FROM package_benefit WHERE PackageId IN (${placeholders})`, existingIds);
      await connection.execute(`DELETE FROM package WHERE CampaignId = ?`, [campaignId]);
    }

    const submittedPackages = (body.packages ?? []).filter(
      (pkg) =>
        pkg &&
        String(pkg.packageType ?? "").trim() !== "" &&
        String(pkg.title ?? "").trim() !== "" &&
        Number(pkg.price) >= 0
    );

    for (const pkg of submittedPackages) {
      const [pkgTypeRows] = await connection.execute(
        `SELECT PackageTypeId FROM package_type WHERE PackageType = ? LIMIT 1`,
        [String(pkg.packageType).trim()]
      );
      const packageTypeId = (pkgTypeRows as { PackageTypeId: number }[])[0]?.PackageTypeId;
      if (!packageTypeId) continue;

      const [packageInsertResult] = await connection.execute(
        `INSERT INTO package (CampaignId, PackageType, Title, Price)
         VALUES (?, ?, ?, ?)`,
        [campaignId, packageTypeId, String(pkg.title).trim().slice(0, 45), Number(pkg.price)]
      );
      const newPackageId = (packageInsertResult as { insertId: number }).insertId;

      if (newPackageId && Array.isArray(pkg.benefitIds) && pkg.benefitIds.length > 0) {
        for (const benefitId of pkg.benefitIds) {
          await connection.execute(
            `INSERT INTO package_benefit (PackageId, BenefitId) VALUES (?, ?)`,
            [newPackageId, Number(benefitId)]
          );
        }
      }
    }

    await connection.commit();

    try {
      await writeCampaignMeta(accountId, campaignId, {
        summary: String(body.summary ?? "").trim(),
        desc: String(body.desc ?? "").trim(),
        websiteUrl: String(body.websiteUrl ?? "").trim(),
        instagramUrl: String(body.instagramUrl ?? "").trim(),
        twitterUrl: String(body.twitterUrl ?? "").trim(),
        facebookUrl: String(body.facebookUrl ?? "").trim(),
        linkedinUrl: String(body.linkedinUrl ?? "").trim(),
      });
    } catch (metaErr) {
      console.error("editcampaign meta write error:", metaErr);
    }

    return NextResponse.json({
      success: true,
      message: "Campaign updated.",
      campaignId,
    });
  } catch (e) {
    try {
      await connection.rollback();
    } catch {
      // ignore
    }
    console.error("editcampaign PATCH error:", e);
    return NextResponse.json({ success: false, error: "Failed to update campaign" }, { status: 500 });
  } finally {
    connection.release();
  }
}
