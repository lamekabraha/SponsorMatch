import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";

async function getAccountId(): Promise<number | null> {
  const session = await getServerSession(authConfig);
  return (session?.user as { accountId?: number })?.accountId ?? null;
}

/** Map a raw metric to [0, 1] using a soft cap (values above cap score as 1). */
function normalize(value: number, cap: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (!Number.isFinite(cap) || cap <= 0) return 0;
  return Math.min(1, value / cap);
}

const IMPACT_CAPS = {
  totalInvested: 100_000,
  activePartnerships: 25,
  connections: 50,
} as const;

function computeImpactScore(
  totalInvested: number,
  activePartnerships: number,
  connections: number,
): number {
  const score =
    30 * normalize(totalInvested, IMPACT_CAPS.totalInvested) +
    40 * normalize(activePartnerships, IMPACT_CAPS.activePartnerships) +
    30 * normalize(connections, IMPACT_CAPS.connections);
  return Math.round(Math.min(100, score));
}

export async function getTotalInvested(accountId: number): Promise<number> {
  const [rows] = await pool.execute(
    `SELECT COALESCE(SUM(d.Amount), 0) AS total
     FROM sponsor_match.donation d
     WHERE d.Donor = ? AND d.PaymentStatus = 'complete'`,
    [accountId],
  );
  const r = (rows as { total: unknown }[])[0];
  const n = Number(r?.total ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Mutual follow between this corporate account and a VCSE (AccountTypeId = 2). */
export async function getActivePartnerships(accountId: number): Promise<number> {
  const [rows] = await pool.execute(
    `SELECT COUNT(DISTINCT v.AccountId) AS cnt
     FROM sponsor_match.account v
     INNER JOIN sponsor_match.following f_cv
       ON f_cv.AccountId = ? AND f_cv.FollowId = v.AccountId
     INNER JOIN sponsor_match.following f_vc
       ON f_vc.AccountId = v.AccountId AND f_vc.FollowId = ?
     WHERE v.AccountTypeId = 2`,
    [accountId, accountId],
  );
  const r = (rows as { cnt: unknown }[])[0];
  const n = Number(r?.cnt ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Distinct accounts this account follows or is followed by (at least one direction). */
export async function getConnections(accountId: number): Promise<number> {
  const [rows] = await pool.execute(
    `SELECT COUNT(DISTINCT other_account) AS cnt FROM (
       SELECT FollowId AS other_account FROM sponsor_match.following WHERE AccountId = ?
       UNION
       SELECT AccountId AS other_account FROM sponsor_match.following WHERE FollowId = ?
     ) t`,
    [accountId, accountId],
  );
  const r = (rows as { cnt: unknown }[])[0];
  const n = Number(r?.cnt ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function getImpactScore(accountId: number): Promise<number> {
  const [totalInvested, activePartnerships, connections] = await Promise.all([
    getTotalInvested(accountId),
    getActivePartnerships(accountId),
    getConnections(accountId),
  ]);
  return computeImpactScore(
    totalInvested,
    activePartnerships,
    connections,
  );
}

export type CorporateDashboardCampaignRow = {
  CampaignId: number;
  CampaignName: string | null;
  CoverImage: string | null;
  GoalAmount: number | null;
  Raised: number;
  Status: string | null;
  Type: string | null;
  Description: string | null;
  OrgName: string | null;
};

/** Campaigns this corporate has completed donations to (partnered), with total raised on each campaign. */
export async function getCorporateCampaigns(
  corporateAccountId: number,
): Promise<CorporateDashboardCampaignRow[]> {
  const [rows] = await pool.execute(
    `SELECT
       c.CampaignId,
       c.CampaignName,
       c.CoverImage,
       c.GoalAmount,
       c.Status,
       ct.Type,
       ct.Description,
       vcse.Name AS OrgName,
       (
         SELECT COALESCE(SUM(d2.Amount), 0)
         FROM sponsor_match.donation d2
         WHERE d2.CampaignId = c.CampaignId
           AND d2.PaymentStatus = 'complete'
       ) AS Raised
     FROM sponsor_match.campaign c
     INNER JOIN sponsor_match.campaign_type ct
       ON ct.CampaignTypeId = c.CampaignTypeId
     INNER JOIN sponsor_match.account vcse
       ON vcse.AccountId = c.AccountId
     WHERE EXISTS (
       SELECT 1
       FROM sponsor_match.donation d
       WHERE d.CampaignId = c.CampaignId
         AND d.Donor = ?
         AND d.PaymentStatus = 'complete'
     )
     ORDER BY c.UpdatedAt DESC, c.CampaignId DESC`,
    [corporateAccountId],
  );

  const list = rows as CorporateDashboardCampaignRow[];
  return list.map((row) => ({
    ...row,
    Raised: Number(row.Raised ?? 0),
    GoalAmount:
      row.GoalAmount != null ? Number(row.GoalAmount) : null,
  }));
}

export type CorporateDashboardData = {
  totalInvested: number;
  activePartnerships: number;
  connections: number;
  impactScore: number;
  campaigns: CorporateDashboardCampaignRow[];
};

/** Shared loader for GET /api/corporateDashboard and Server Components. */
export async function loadCorporateDashboardData(
  accountId: number,
): Promise<CorporateDashboardData> {
  const [totalInvested, activePartnerships, connections, campaigns] =
    await Promise.all([
      getTotalInvested(accountId),
      getActivePartnerships(accountId),
      getConnections(accountId),
      getCorporateCampaigns(accountId),
    ]);
  const impactScore = computeImpactScore(
    totalInvested,
    activePartnerships,
    connections,
  );
  return {
    totalInvested,
    activePartnerships,
    connections,
    impactScore,
    campaigns,
  };
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
    const data = await loadCorporateDashboardData(accountId);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("[corporateDashboard]", e);
    return NextResponse.json(
      { success: false, error: "Failed to load corporate dashboard" },
      { status: 500 },
    );
  }
}
