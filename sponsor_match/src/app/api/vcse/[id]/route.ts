import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

// session helper
async function getCurrentAccountId(): Promise<number | null> {
  const session = await getServerSession(authConfig);
  return (session?.user as {accountId?: number})?.accountId || null;
}

// TypeScript interfaces for the response
interface Account {
  id: number;
  name: string;
  industry: string;
  description: string;
  logo: string | null;
  cover: string | null;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Verification {
  isVerified: boolean;
  document: string;
}

interface Location {
  address: string;
}

interface Impact {
  totalRaised: number;
  activeCampaigns: number;
  totalCampaigns: number;
  donationsCount: number;
}

interface Campaign {
  id: number;
  name: string;
  coverImage: string | null;
  goal: number;
  raised: number;
  progress: number;
}

interface Benefit {
  name: string;
  description: string;
}

interface VCSEProfile {
  account: Account;
  verification: Verification;
  locations: Location[];
  impact: Impact;
  campaigns: Campaign[];
  benefits: Benefit[];
  isFollowed: boolean;
}

// Helper function to normalize image URLs
function normalizeImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path starting with 'accounts/', convert to full URL
  if (imagePath.startsWith('accounts/')) {
    const baseUrl = process.env.AUTH_URL?.replace('/api/auth', '') || 'http://localhost:3000';
    return `${baseUrl}/api/files/${imagePath}`;
  }

  return null;
}

// Helper function to calculate campaign raised amount and progress
async function getCampaignDetails(campaignId: number, goal: number): Promise<{ raised: number; progress: number }> {
  const [donationRows] = await pool.execute(
    'SELECT COALESCE(SUM(Amount), 0) as raised FROM donation WHERE CampaignId = ?',
    [campaignId]
  );
  const raised = (donationRows as { raised: number }[])[0].raised;
  const progress = goal > 0 ? (raised / goal) * 100 : 0;
  return { raised, progress };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vcseAccountId = parseInt(id);
    if (isNaN(vcseAccountId)) {
      return NextResponse.json({ error: 'Invalid VCSE ID' }, { status: 400 });
    }

    const currentAccountId = await getCurrentAccountId();
    if (!currentAccountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch account data
    const [accountRows] = await pool.execute(
      'SELECT AccountId, Name, IndustrySector, CompanyLogo, CompanyCover, Description, ContactName, ContactEmail, ContactPhone FROM account WHERE AccountId = ?',
      [vcseAccountId]
    );

    if ((accountRows as any[]).length === 0) {
      return NextResponse.json({ error: 'VCSE not found' }, { status: 404 });
    }

    const accountData = (accountRows as any[])[0];

    // Fetch VCSE verification data
    const [vcseRows] = await pool.execute(
      'SELECT VerificationDoc FROM vcse WHERE AccountId = ?',
      [vcseAccountId]
    );
    const vcseData = (vcseRows as any[])[0] || {};

    // Fetch locations
    const [locationRows] = await pool.execute(
      'SELECT Address FROM location WHERE AccountId = ?',
      [vcseAccountId]
    );

    // Fetch active campaigns
    const [campaignRows] = await pool.execute(
      'SELECT CampaignId, CampaignName, CoverImage, GoalAmount FROM campaign WHERE AccountId = ? AND Status = "open"',
      [vcseAccountId]
    );

    // Get campaign details with raised amounts and progress
    const campaigns: Campaign[] = [];
    for (const campaign of campaignRows as any[]) {
      const { raised, progress } = await getCampaignDetails(campaign.CampaignId, campaign.GoalAmount);
      campaigns.push({
        id: campaign.CampaignId,
        name: campaign.CampaignName,
        coverImage: campaign.CoverImage,
        goal: campaign.GoalAmount,
        raised,
        progress: Math.round(progress * 100) / 100 // Round to 2 decimal places
      });
    }

    // Calculate impact metrics
    const [totalRaisedRows] = await pool.execute(
      'SELECT COALESCE(SUM(d.Amount), 0) as totalRaised FROM donation d JOIN campaign c ON d.CampaignId = c.CampaignId WHERE c.AccountId = ?',
      [vcseAccountId]
    );
    const totalRaised = (totalRaisedRows as { totalRaised: number }[])[0].totalRaised;

    const [activeCampaignsRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM campaign WHERE AccountId = ? AND Status = "open"',
      [vcseAccountId]
    );
    const activeCampaigns = (activeCampaignsRows as { count: number }[])[0].count;

    const [totalCampaignsRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM campaign WHERE AccountId = ?',
      [vcseAccountId]
    );
    const totalCampaigns = (totalCampaignsRows as { count: number }[])[0].count;

    const [donationsCountRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM donation d JOIN campaign c ON d.CampaignId = c.CampaignId WHERE c.AccountId = ?',
      [vcseAccountId]
    );
    const donationsCount = (donationsCountRows as { count: number }[])[0].count;

    // Fetch benefits (assuming campaign -> package -> package_benefit -> benefit)
    // Note: This assumes package has CampaignId, package_benefit has PackageId and BenefitId
    const [benefitRows] = await pool.execute(`
      SELECT DISTINCT b.Name, b.Description
      FROM benefit b
      JOIN package_benefit pb ON b.BenefitId = pb.BenefitId
      JOIN package p ON pb.PackageId = p.PackageId
      JOIN campaign c ON p.CampaignId = c.CampaignId
      WHERE c.AccountId = ?
    `, [vcseAccountId]);

    // Check if followed
    const [followRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM following WHERE AccountId = ? AND FollowId = ?',
      [currentAccountId, vcseAccountId]
    );
    const isFollowed = (followRows as { count: number }[])[0].count > 0;

    // Construct response
    const response: VCSEProfile = {
      account: {
        id: accountData.AccountId,
        name: accountData.Name,
        industry: accountData.IndustrySector,
        description: accountData.Description,
        logo: normalizeImageUrl(accountData.CompanyLogo),
        cover: normalizeImageUrl(accountData.CompanyCover),
        contact: {
          name: accountData.ContactName,
          email: accountData.ContactEmail,
          phone: accountData.ContactPhone
        }
      },
      verification: {
        isVerified: !!vcseData.VerificationDoc,
        document: normalizeImageUrl(vcseData.VerificationDoc) || ''
      },
      locations: (locationRows as { Address: string }[]).map(row => ({ address: row.Address })),
      impact: {
        totalRaised,
        activeCampaigns,
        totalCampaigns,
        donationsCount
      },
      campaigns: campaigns.map(campaign => ({
        ...campaign,
        coverImage: normalizeImageUrl(campaign.coverImage)
      })),
      benefits: (benefitRows as { Name: string; Description: string }[]).map(row => ({
        name: row.Name,
        description: row.Description
      })),
      isFollowed
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching VCSE profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}