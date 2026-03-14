"use client";

import "./dashboard.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { DashboardDataCard } from "../Components/DashboardDataCard";
import { DashboardCampaignCard } from "../Components/DashboardCampaignCard";

interface DashboardData {
  totalRaised: number;
  activeCampaign: number;
  connections: number | null;
  averageEngagement: number;
  campaigns: any[];
}



type Campaign = {
  id: string;
  CampaignName: string;
  CoverImage: string;
  GoalAmount: number;
  Raised: number;
  Status: number;
  Type: string;
  Description: string;
};

// const campaigns: Campaign[] = [
//   {
//     id: "1",
//     title: "Basketball Community",
//     org: "Sports For All",
//     category: "Sports",
//     deadline: "11/03/2026",
//     raised: 2000,
//     goal: 5000,
//     imageUrl: "/campaigns/basketball.jpg",
//   },
//   {
//     id: "2",
//     title: "Coding Team",
//     org: "Tech Made Easy",
//     category: "Education",
//     deadline: "11/14/2023",
//     raised: 4500,
//     goal: 10000,
//     imageUrl: "/campaigns/coding.jpg",
//   },
//   {
//     id: "3",
//     title: "Homeless Support Initiative",
//     org: "Shelter Plus",
//     category: "Poverty Relief",
//     deadline: "11/03/2026",
//     raised: 2000,
//     goal: 5000,
//     imageUrl: "/campaigns/homeless.jpg",
//   },
// ];

const FAV_KEY = "sponsorMatch:favourites";

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(raised: number, goal: number) {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

function readFavs(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavs(ids: string[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M12 17.3l-6.18 3.7 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62 7.19.62-5.46 4.73 1.64 7.03z"
        fill={filled ? "#fed857" : "none"}
        stroke={filled ? "#0b0f19" : "#0b0f19"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const [favs, setFavs] = useState<string[]>([]);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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

  useEffect(() => {
    setFavs(readFavs());
  }, []);

  useEffect(() => {
    writeFavs(favs);
  }, [favs]);

  const favCount = useMemo(() => favs.length, [favs]);

  function toggleFav(id: string) {
    setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <><Navbar />
    <div className="page">
      <main className="container ">
        

        <section className="titleRow">
          <h1 className="title">Your Campaigns Dashboard</h1>
          <div className="flex gap-2">
            <Link
              href="/favourites"
              className="btn btnGhost text-decoration-none font-weight-900"
            >
              ★ Favourites ({favCount})
            </Link>
            <Link href="/newcampaign">
              <button className="btn btnPrimary">＋ Create Campaign</button>
            </Link>
          </div>
        </section>

        <section className="statsGrid">
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
        </section>

        <section className="filters">
          <input className="search" placeholder="Search campaigns..." />
          <select className="select" defaultValue="all">
            <option value="all">All Categories</option>
            <option value="sports">Sports</option>
            <option value="education">Education</option>
            <option value="poverty">Poverty Relief</option>
          </select>
          <button className="btn btnGhost">More Filters</button>
        </section>

        <section className="grid">
          {(dashboardData?.campaigns ?? []).map((campaign: any) => (
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
          ))}
        </section>
      </main>
    </div>
    </>
  );
}
