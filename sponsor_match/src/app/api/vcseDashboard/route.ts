//JSON CONTRACT FOR THE DASHBOARD
/*
{
    "success": true,
    "data": {
        "totalRaised": 10000,
        "activeCampaigns": 10,
        "connections": 100
        "averageEngagement": 80
        "campaigns": [
            {
                "id": 1,
                "title": "Campaign 1",
                "description": "Description 1",
                "image": "image1.jpg",
                "raised": 1000,
                "goal": 10000,
                "deadline": "2026-03-10",
                "category": "Sports",
                "org": "Org 1",
                "swipeStatus": false
            }
        ]
    }
}
*/

import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import { resolveStoragePath, toStorageRelativePath } from '@/lib/storage';
import fs from 'fs/promises';

// session helper
async function GetAccountId(): Promise<number | null> {
    const session = await getServerSession(authConfig);
    return (session?.user as {accountId?: number})?.accountId || null;
}

async function GetTotalRaisedCount(accountId: number): Promise<number> {
    const [rows] = await pool.execute(
        `select sum(Amount) as totalRaised from sponsor_match.donation
        inner join campaign on campaign.CampaignId = donation.CampaignId
        where campaign.AccountId = ?`, [accountId]
    );

    const result = rows as {totalRaised: number}[];
    return result.length > 0 ? result[0].totalRaised: 0 
};

async function GetActiveCampaignCount(accountId: number): Promise<number> {
    const [rows] = await pool.execute(
        `select count(CampaignId) as activeCount from campaign where status="open" and accountId = ?`, [accountId]
    )

    const result = rows as {activeCount:number}[];
   return result.length > 0 ? result[0].activeCount : 0
};

// fix this, result returns undefined
async function GetConnectionsCount(accountId: number): Promise<number> {

    const [rows] = await pool.execute(
        `select count(distinct f1.FollowId) from sponsor_match.following f1
        join following f2 on f1.AccountId = f2.AccountId and f1.FollowId = f2.FollowId
        where f1.AccountId = ? or f1.FollowId = ?`, [accountId, accountId]
    )
    const result = rows as {connectionCount: number}[];
    return result.length > 0 || undefined ? result[0].connectionCount : 0
};

async function GetEngagement(accountId:number): Promise<number> {
    const [views] = await pool. execute(
        `select count(*) as totalViews from campaign
        join engagement on campaign.CampaignId = engagement.CampaignId
        inner join account on account.AccountId = campaign.AccountId
        where campaign.AccountId = ?`, [accountId]
    );

    const viewedResult = views as {totalViews: number}[]; 

    if (!viewedResult.length || viewedResult[0].totalViews === 0) {
        return 0
    }

    const [positive] = await pool.execute(
        `select count(*) as positiveInteraction from campaign
        join engagement on campaign.CampaignId = engagement.CampaignId
        inner join account on account.AccountId = campaign.AccountId
        where campaign.AccountId = ? and engagement.SwipeType = 'favourite' and engagement.Status in ('liked', 'matched')`, [accountId] 
    )

    const positiveResult = positive as {positiveInteraction:number}[]

    const engagementPercent = viewedResult[0]?.totalViews && positiveResult[0]?.positiveInteraction !== undefined
        ? (positiveResult[0].positiveInteraction / viewedResult[0].totalViews) * 100
        : 0;



    return engagementPercent;
}

async function GetCampaignData(accountId: number): Promise<any[]> {
    const [rows] = await pool.execute(
        `SELECT c.CampaignId, c.CampaignName, c.CoverImage, c.GoalAmount, sum(d.Amount) as Raised, c.Status, t.Type, t.Description
        FROM campaign c
		inner join campaign_type t on t.CampaignTypeId = c.CampaignTypeId
        left join donation d on d.CampaignId = c.CampaignId
        WHERE AccountId = ? 
        group by c.CampaignId`,
        [accountId]
    );
    const campaigns = rows as any[];

    const campaignsWithValidatedCover = await Promise.all(
        campaigns.map(async (campaign) => {
            const relativeCoverPath = toStorageRelativePath(campaign.CoverImage);

            if (!relativeCoverPath) {
                return { ...campaign, CoverImage: null };
            }

            try {
                await fs.access(resolveStoragePath(relativeCoverPath));
                return { ...campaign, CoverImage: relativeCoverPath };
            } catch {
                // Avoid frontend 404s by falling back when the DB path is stale.
                return { ...campaign, CoverImage: null };
            }
        })
    );

    return campaignsWithValidatedCover;
}

async function GetCampaignTypes(accountId: number): Promise<any[]>{
    const [rows] = await pool.execute(
        `select * from campaign_type`
    );

    const campaignType = rows as any[];
    return campaignType;
}

export async function GET(request: NextRequest) {
    
    const accountId = await GetAccountId();

    if (!accountId) {
        return NextResponse.json({success: false, error: 'Unauthorised'}, {status: 401});
    }

    try{
        const [
            totalRaised,
            activeCampaigns, 
            connections,
            averageEngagement,
            campaign,
            campaignType
        ] = await Promise.all([
            GetTotalRaisedCount(accountId),
            GetActiveCampaignCount(accountId),
            GetConnectionsCount(accountId),
            GetEngagement(accountId),
            GetCampaignData(accountId),
            GetCampaignTypes(accountId)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                accountId: accountId,
                totalRaised: totalRaised,
                activeCampaign: activeCampaigns,
                connections: connections,
                averageEngagement: averageEngagement,
                campaigns: campaign,
                campaignTypes: campaignType
            }
        });
    }catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({success: false, error: 'Failed to load dashboard data'}, {status: 500})
    }
}