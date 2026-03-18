"use client";

import "./dashboard.css";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { DashboardDataCard } from "../Components/DashboardDataCard";
import { DashboardCampaignCard } from "../Components/DashboardCampaignCard";
import DashboardSkeleton from "./dashboardSkeletonQuickData";
import CampaignCardSkeleton from "./dashboardSkeletonCampaignCards";

interface DashboardData {
  totalRaised: number;
  activeCampaign: number;
  connections: number | null;
  averageEngagement: number;
  campaignTypes: any[];
  campaigns: any[];
}

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function LoadingQuickData() {
  return (
    <>
      <DashboardSkeleton />
      <DashboardSkeleton />
      <DashboardSkeleton />
      <DashboardSkeleton />
    </>
  );
}

function LoadingCampaignCards() {
  return (
    <>
      <CampaignCardSkeleton/>
      <CampaignCardSkeleton/>
      <CampaignCardSkeleton/>
    </>
  )
}

export default function DashboardPage() {
  const [favs, setFavs] = useState<string[]>([]);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryQuery, setCategoryQuery]= useState('');
  const [isLoading, SetIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
  const fetchDashboardData = async () => {
    try{
      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      }else{
        throw new Error(result.error || 'Unknown error occurred');
      }
    }catch (error: any){
      setError(error.message)
    }finally{
      SetIsLoading(false);
    }
  };
  fetchDashboardData();
  }, [])
  
  console.log(dashboardData)


  const filteredCampaigns = useMemo(() => {
    const campaigns = dashboardData?.campaigns ?? [];
    const normalizeSearch = searchQuery.toLowerCase().trim();

    return campaigns.filter((campaign: any) => {
      const matchCategory =
        !categoryQuery || campaign.Type === categoryQuery;
      const matchSearch =
        !normalizeSearch ||
        campaign.CampaignName?.toLowerCase().includes(normalizeSearch) ||
        campaign.Type?.toLowerCase().includes(normalizeSearch);
      return matchCategory && matchSearch;
    });
  }, [dashboardData?.campaigns, searchQuery, categoryQuery]);

  return (
    <>
      <Navbar />
      <div className="page">
        <main className="container ">
          

          <section className="titleRow">
            <h1 className="title">Your Campaigns Dashboard</h1>
            <div className="flex gap-2">
              {/* <Link
                href="/favourites"
                className="btn btnGhost text-decoration-none font-weight-900"
              >
                ★ Favourites ({favCount})
              </Link> */}
              <Link href="/newcampaign">
                <button className="btn btnPrimary">＋ Create Campaign</button>
              </Link>
            </div>
          </section>

          {/* Quick Data Cards */}
          <section className="statsGrid">
            {isLoading ? (
              <LoadingQuickData/>
            ) :(
              <>
                <DashboardDataCard
                  title="Total Raised"
                  data={formatGBP(dashboardData?.totalRaised ?? 0)}
                />
                <DashboardDataCard
                  title="Active Campaigns"
                  data={(dashboardData?.activeCampaign ?? 0).toString()}
                />
                <DashboardDataCard
                  title="Connections"
                  data={(dashboardData?.connections ?? 0).toString()}
                />
                <DashboardDataCard
                  title="Avg. Engagement"
                  data={`${Math.round(dashboardData?.averageEngagement ?? 0)}%`}
                />
              </>
            )}
          </section>

          <section className="filters">
            {/* Search and Filter */}
            <input value={searchQuery}  onChange={(e) => setSearchQuery(e.target.value)} className="search" placeholder="Search campaigns..." />
            <select
              value={categoryQuery}
              onChange={e => setCategoryQuery(e.target.value)}
              className="select"
            >
              <option value="">All Campaigns</option>
              {(dashboardData?.campaignTypes ?? []).map((campaignType: any) => (
                <option
                  key={campaignType.CampaignTypeId}
                  value={campaignType.Type}
                >
                  {campaignType.Type}
                </option>
              ))}
            </select>
            <button className="btn btnGhost">More Filters</button>
          </section>

        {/* Campaign Cards */}
        <section className="grid">
          {isLoading ? (
            <LoadingCampaignCards />
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign: any) => (
              <article key={campaign.CampaignId} className="card">
                <DashboardCampaignCard
                  title={campaign.CampaignName}
                  category={campaign.Type}
                  raised={campaign.Raised}
                  goal={Number(campaign.GoalAmount ?? 0)}
                  status={campaign.Status}
                  coverImageUrl={
                    campaign.CoverImage
                      ? `/api/files/${campaign.CoverImage}`
                      : null
                  }
                />
              </article>
            ))
          ) : (
            <div>No Campaigns match your search</div>
          )}
        </section>
        </main>
      </div>
    </>
  );
}
