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
  const [moreFilter, setMoreFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('recent');
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

  const VisibleCampaigns = useMemo(() => {
    const base = filteredCampaigns;

    const statusFiltered = 
      statusFilter === 'all'
      ? base
      : base.filter((campaign: any) => campaign.Status === statusFilter)
    const sorted = [...statusFiltered].sort((a: any, b: any) => {
      const goalA = Number(a.GoalAmount ?? 0);
      const goalB = Number(b.GoalAmount ?? 0);
      const raisedA = Number(a.Raised ?? 0);
      const raisedB = Number(b.Raised ?? 0);
      const createdA = new Date(a.CreatedAt ?? 0).getTime();
      const createdB = new Date(b.CreatedAt ?? 0).getTime();

      switch (orderFilter) {
        case "goalMax":
          return goalB - goalA;
        case "goalMin":
          return goalA - goalB;
        case "raisedMax":
          return raisedB - raisedA;
        case "raisedMin":
          return raisedA - raisedB;
        case "popular":
          return raisedB - raisedA;
        case "recent":
        default:
          return createdB - createdA;
      }
    });

    return sorted;
  }, [filteredCampaigns, statusFilter, orderFilter])

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
            <button
              className="btn btnGhost"
              type="button"
              onClick={() => setMoreFilter((prev) => !prev)}
              aria-expanded={moreFilter}
              aria-controls="more-filters-panel"
            >
              {moreFilter ? "Hide Filters" : "More Filters"}
            </button>
          </section>
          {/* More Filters */}
          {moreFilter && (
          <section id="more-filters-panel" className="flex justify-end w-full">
            <div className="flex justify-end gap-4 w-fit rounded-2xl mt-2 p-4 " style={{ backgroundColor: 'rgba(254, 216, 87, 0.4)' }}>
                <div>
                  <label htmlFor="status" className="px-2">Status:</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} name="status" id="status" className="rounded-2xl bg-Grey-light py-1 px-3 capitalize">
                    <option value="all" >All</option>
                    {[...new Set((dashboardData?.campaigns ?? []).map((campaign: any) => campaign.Status))]
                      .filter(status => status && status !== "")
                      .map((status: string) => (
                        <option key={status} value={status} className="capitalize">{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                    {/* order by: goal min/max; raised min/max; recent/oldest; */}
                    <label htmlFor="order" className="px-2">Order By: </label>
                    <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} name="order" id="order" className="rounded-2xl bg-Grey-light py-1 px-3 capitalize">
                      <option value="recent">Recent</option>
                      <option value="popular">Popularity</option>
                      <option value="goalMax">Max Goal</option>
                      <option value="goalMin">Min Goal</option>
                      <option value="raisedMax">Max Raised</option>
                      <option value="raisedMin">Min Raised</option>
                    </select>
                </div>

            </div>
          </section>
          )}

        {/* Campaign Cards */}
        <section className="grid">
          {isLoading ? (
            <LoadingCampaignCards />
          ) : VisibleCampaigns.length > 0 ? (
            VisibleCampaigns.map((campaign: any) => (
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
