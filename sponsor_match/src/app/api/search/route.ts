import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { resolveStoragePath, toStorageRelativePath } from "@/lib/storage";
import fs from "fs/promises";

type SearchCampaign = {
  id: string;
  title: string;
  org: string;
  category: string;
  deadline: string;
  raised: number;
  goal: number;
  imageUrl: string | null;
};

type SearchResponse = {
  campaigns: SearchCampaign[];
  categories: string[];
};

function parseCommaOrArray(param: string | null): string[] {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = String(searchParams.get("q") ?? "").trim();

  const categoriesParam = searchParams.get("categories");
  const selectedCategories = parseCommaOrArray(categoriesParam);

  const maxBudgetRaw = searchParams.get("maxBudget");
  const maxBudget = maxBudgetRaw ? Number(maxBudgetRaw) : 20000;

  // Distance is currently a UI-only filter (no geo tables in dump).
  // Keep it in the contract so frontend can send it without breaking.
  searchParams.get("distance");

  const categoryRows = (await pool.execute(
    `SELECT CampaignTypeId, Type
     FROM sponsor_match.campaign_type
     ORDER BY CampaignTypeId ASC`,
  ))[0] as { Type: string }[];

  const allCategories = Array.from(
    new Set((categoryRows ?? []).map((r) => r.Type).filter(Boolean)),
  ).sort();

  const placeholders = selectedCategories.map(() => "?").join(",");
  const categoryClause =
    selectedCategories.length > 0 ? `AND ct.Type IN (${placeholders})` : "";

  const qClause = q
    ? `AND (
        c.CampaignName LIKE ?
        OR a.Name LIKE ?
        OR ct.Type LIKE ?
      )`
    : "";

  const qLike = q ? `%${q}%` : "%";
  const args: any[] = [];
  if (selectedCategories.length > 0) args.push(...selectedCategories);
  if (q) args.push(qLike, qLike, qLike);

  // Deadline: dump doesn’t include a true deadline column, so we display an ISO-ish date from UpdatedAt.
  const [rows] = await pool.execute(
    `SELECT
        c.CampaignId AS id,
        c.CampaignName AS title,
        a.Name AS org,
        ct.Type AS category,
        DATE_FORMAT(c.UpdatedAt, '%m/%d/%Y') AS deadline,
        COALESCE(SUM(d.Amount), 0) AS raised,
        c.GoalAmount AS goal,
        c.CoverImage AS coverImage
     FROM sponsor_match.campaign c
     INNER JOIN sponsor_match.campaign_type ct
       ON ct.CampaignTypeId = c.CampaignTypeId
     INNER JOIN sponsor_match.account a
       ON a.AccountId = c.AccountId
     LEFT JOIN sponsor_match.donation d
       ON d.CampaignId = c.CampaignId
      AND d.PaymentStatus = 'complete'
     WHERE c.Status = 'open'
       AND c.GoalAmount <= ?
       ${categoryClause}
       ${qClause}
     GROUP BY c.CampaignId
     ORDER BY c.UpdatedAt DESC
     LIMIT 60`,
    [maxBudget, ...args],
  );

  const list = await Promise.all(
    (rows as any[]).map(async (r) => {
      const coverRel = toStorageRelativePath(
        r.coverImage == null ? null : String(r.coverImage),
      );

      let validatedCover: string | null = null;
      if (coverRel) {
        try {
          await fs.access(resolveStoragePath(coverRel));
          validatedCover = coverRel;
        } catch {
          validatedCover = null;
        }
      }

      return {
        id: String(r.id),
        title: String(r.title ?? ""),
        org: String(r.org ?? ""),
        category: String(r.category ?? ""),
        deadline: String(r.deadline ?? ""),
        raised: Number(r.raised ?? 0),
        goal: Number(r.goal ?? 0),
        imageUrl: validatedCover,
      };
    }),
  );

  const payload: SearchResponse = {
    campaigns: list,
    categories: allCategories,
  };

  return NextResponse.json({ success: true, data: payload });
}

