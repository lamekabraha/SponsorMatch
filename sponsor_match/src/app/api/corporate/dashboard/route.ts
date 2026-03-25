import { NextResponse } from "next/server";

type CampaignType = {
  CampaignTypeId: number;
  Type: string;
};

type CorporateCampaign = {
  CampaignId: number;
  CampaignName: string;
  Type: string;
  Raised: number;
  GoalAmount: number;
  CoverImage: string | null;
  MatchScore: number; // 0..100
  Status: string;
  OrgName: string;
  Deadline: string;
};

export async function GET() {
  // Mock data for the business/sponsor dashboard.
  // In a follow-up, these values should be replaced with DB-backed results keyed by the session account.
  const campaignTypes: CampaignType[] = [
    { CampaignTypeId: 1, Type: "Environment" },
    { CampaignTypeId: 2, Type: "Education" },
    { CampaignTypeId: 3, Type: "Poverty Relief" },
    { CampaignTypeId: 4, Type: "Sports" },
  ];

  const campaigns: CorporateCampaign[] = [
    {
      CampaignId: 301,
      CampaignName: "Community Clean Water 2026",
      Type: "Environment",
      Raised: 4200,
      GoalAmount: 10000,
      CoverImage: "/204Cover.jpg",
      MatchScore: 98,
      Status: "open",
      OrgName: "River Guardians",
      Deadline: "2026-04-18",
    },
    {
      CampaignId: 302,
      CampaignName: "Youth Coaching Programme",
      Type: "Sports",
      Raised: 6100,
      GoalAmount: 12000,
      CoverImage: "/loadingImage.jpg",
      MatchScore: 93,
      Status: "open",
      OrgName: "Youth Forward",
      Deadline: "2026-05-01",
    },
    {
      CampaignId: 303,
      CampaignName: "Learning Access for All",
      Type: "Education",
      Raised: 2800,
      GoalAmount: 9000,
      CoverImage: "/LandingPageImage2.png",
      MatchScore: 88,
      Status: "open",
      OrgName: "Bright Futures Trust",
      Deadline: "2026-04-30",
    },
  ];

  return NextResponse.json({
    totalInvested: 12400,
    activePartnerships: 5,
    connections: 8,
    impactScore: 92,
    campaignTypes,
    campaigns,
  });
}

