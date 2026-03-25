import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { pool } from "@/lib/db";
import { resolveStoragePath, toStorageRelativePath } from "@/lib/storage";
import fs from "fs/promises";
import path from "path";

async function GetAccountId(): Promise<number | null> {
  const session = await getServerSession(authConfig);
  return (session?.user as { accountId?: number })?.accountId ?? null;
}


type NewCampaignPayload = {
  name: string;
  type: string;
  goal: number;
  raised?: number;
  location?: string;
  desc: string;
  summary?: string;
  startDate?: string;
  endDate?: string;
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

type SaveCampaignResult = {
  success: boolean;
  campaignId?: number;
  message: string;
  // Useful for debugging payload shape while DB logic is pending.
  received?: NewCampaignPayload;
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

async function buildCampaignAdditionalImagePaths(
  accountId: number,
  campaignId: number,
  sourcePaths: string[] | undefined
): Promise<string[]> {
  const normalizedSourcePaths = (sourcePaths ?? [])
    .map((value) => String(value).trim().replace(/^\/api\/files\/+/, ""))
    .map((value) => toStorageRelativePath(value))
    .filter((value): value is string => Boolean(value));

  const mappedPaths: string[] = [];

  for (let index = 0; index < normalizedSourcePaths.length; index++) {
    const sourceRelativePath = normalizedSourcePaths[index];
    const sourceAbsolutePath = resolveStoragePath(sourceRelativePath);
    const ext = path.extname(sourceRelativePath).replace(".", "").toLowerCase() || "jpg";
    const targetRelativePath = `accounts/${accountId}/Campaign/${campaignId}/AdditionalImages/Image_${index + 1}.${ext}`;
    const targetAbsolutePath = resolveStoragePath(targetRelativePath);

    await fs.mkdir(path.dirname(targetAbsolutePath), { recursive: true });
    await fs.copyFile(sourceAbsolutePath, targetAbsolutePath);
    // Cleanup temp upload after successfully copying to the campaign folder
    // to avoid folder bloat and confusing duplicates.
    try {
      await fs.unlink(sourceAbsolutePath);
    } catch {
      // Non-fatal: ignore failures (e.g. file already removed / permissions).
    }
    mappedPaths.push(targetRelativePath);
  }

  return mappedPaths;
}

function getAdditionalImagesFolderPath(accountId: number, campaignId: number): string {
  return `accounts/${accountId}/Campaign/${campaignId}/AdditionalImages`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<NewCampaignPayload>;

    if (!body?.name || !body?.type || !body?.goal || !body?.desc) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required campaign fields.",
        } satisfies SaveCampaignResult,
        { status: 400 }
      );
    }
    
    // 1) Read accountId from authenticated session.
    const accountId = await GetAccountId();
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Convert submitted cover URL/path to DB storage path (accounts/...).
    // Accepts either:
    // - /api/files/accounts/26/CampaignCover/CampaignCover.png
    // - accounts/26/CampaignCover/CampaignCover.png
    const rawCoverValue = String(body.coverImageUrl ?? "").trim();
    const normalizedCoverValue = rawCoverValue.replace(/^\/api\/files\/+/, "");
    const coverImagePath = toStorageRelativePath(normalizedCoverValue);

    // Resolve campaign type string -> CampaignTypeId.
    const [typeRows] = await pool.execute(
      `SELECT CampaignTypeId FROM campaign_type WHERE Type = ? LIMIT 1`,
      [body.type]
    );
    const campaignTypeId = (typeRows as { CampaignTypeId: number }[])[0]?.CampaignTypeId;

    if (!campaignTypeId) {
      return NextResponse.json(
        { success: false, message: "Invalid campaign type." } satisfies SaveCampaignResult,
        { status: 400 }
      );
    }

    // Prevent duplicate campaign creation for the same account.
    const [duplicateRows] = await pool.execute(
      `SELECT CampaignId
       FROM campaign
       WHERE AccountId = ? AND CampaignName = ? AND CampaignTypeId = ?
       LIMIT 1`,
      [accountId, body.name.trim(), campaignTypeId]
    );
    const existingCampaignId = (duplicateRows as { CampaignId: number }[])[0]?.CampaignId;
    if (existingCampaignId) {
      return NextResponse.json(
        {
          success: false,
          message: "This campaign has already been saved.",
          campaignId: existingCampaignId,
        } satisfies SaveCampaignResult,
        { status: 409 }
      );
    }

    // Create campaign first so we can store cover using Campaign/{campaignId}/Cover.ext.
    const [insertResult] = await pool.execute(
      `INSERT INTO campaign (AccountId, CampaignName, CampaignTypeId, CoverImage, GoalAmount, Status)
       VALUES (?, ?, ?, ?, ?, 'open')`,
      [
        accountId,
        body.name.trim(),
        campaignTypeId,
        null,
        Number(body.goal),
      ]
    );
    const campaignId = (insertResult as { insertId: number }).insertId;
    const finalCoverPath = await buildCampaignCoverPath(accountId, campaignId, coverImagePath);
    const finalAdditionalImagePaths = await buildCampaignAdditionalImagePaths(
      accountId,
      campaignId,
      body.additionalImageUrls
    );
    const additionalImagesFolderPath =
      finalAdditionalImagePaths.length > 0
        ? getAdditionalImagesFolderPath(accountId, campaignId)
        : null;

    if (finalCoverPath || additionalImagesFolderPath) {
      await pool.execute(
        `UPDATE campaign
         SET CoverImage = ?, AdditionalImagePath = ?
         WHERE CampaignId = ? AND AccountId = ?`,
        [finalCoverPath, additionalImagesFolderPath, campaignId, accountId]
      );
    }

    // Save sponsorship packages linked to this campaign.
    const submittedPackages = (body.packages ?? []).filter(
      (pkg) =>
        pkg &&
        String(pkg.packageType ?? "").trim() !== "" &&
        String(pkg.title ?? "").trim() !== "" &&
        Number(pkg.price) >= 0
    );

    if (submittedPackages.length > 0) {
      for (const pkg of submittedPackages) {
        const [pkgTypeRows] = await pool.execute(
          `SELECT PackageTypeId FROM package_type WHERE PackageType = ? LIMIT 1`,
          [String(pkg.packageType).trim()]
        );
        const packageTypeId = (pkgTypeRows as { PackageTypeId: number }[])[0]?.PackageTypeId;

        if (!packageTypeId) {
          continue;
        }

        const [packageInsertResult] = await pool.execute(
          `INSERT INTO package (CampaignId, PackageType, Title, Price)
           VALUES (?, ?, ?, ?)`,
          [
            campaignId,
            packageTypeId,
            String(pkg.title).trim().slice(0, 45),
            Number(pkg.price),
          ]
        );
        const packageId = (packageInsertResult as { insertId: number }).insertId;

        if (packageId && Array.isArray(pkg.benefitIds) && pkg.benefitIds.length > 0) {
          for (const benefitId of pkg.benefitIds) {
            await pool.execute(
              `INSERT INTO package_benefit (PackageId, BenefitId)
               VALUES (?, ?)`,
              [packageId, Number(benefitId)]
            );
          }
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        campaignId,
        message: "Campaign saved successfully.",
        received: {
          name: body.name,
          type: body.type,
          goal: Number(body.goal),
          raised: Number(body.raised ?? 0),
          location: body.location ?? "",
          desc: body.desc,
          summary: body.summary ?? "",
          coverImageUrl: finalCoverPath ?? "",
          additionalImageUrls: finalAdditionalImagePaths,
          websiteUrl: body.websiteUrl ?? "",
          instagramUrl: body.instagramUrl ?? "",
          twitterUrl: body.twitterUrl ?? "",
          facebookUrl: body.facebookUrl ?? "",
          linkedinUrl: body.linkedinUrl ?? "",
          startDate: body.startDate,
          endDate: body.endDate,
        },
      } satisfies SaveCampaignResult,
      { status: 201 }
    );
  } catch (error) {
    console.error("newCampaign POST template error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body or server error.",
      } satisfies SaveCampaignResult,
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [packageTypeRows] = await pool.execute(
      `SELECT PackageTypeId, PackageType
       FROM package_type
       ORDER BY PackageTypeId ASC`
    );
    const [benefitRows] = await pool.execute(
      `SELECT BenefitId, Name, Description
       FROM benefit
       ORDER BY BenefitId ASC`
    );

    return NextResponse.json({
      success: true,
      data: {
        packageTypes: packageTypeRows,
        benefits: benefitRows,
      },
    });
  } catch (error) {
    console.error("newCampaign metadata GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load package metadata." },
      { status: 500 }
    );
  }
}
