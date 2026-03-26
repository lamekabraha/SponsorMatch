"use client";

import Navbar from "@/app/Components/Navbar";
import Link from "next/link";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DashboardDataCard } from "@/app/Components/DashboardDataCard";
import { DashboardCampaignCard } from "@/app/Components/DashboardCampaignCard";
import Footer from "@/app/Components/Footer";
import { toStorageRelativePath } from "@/lib/storagePaths";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardSkeleton from "../../Components/dashboardSkeletonQuickData";
import CampaignCardSkeleton from "../../Components/dashboardSkeletonCampaignCards";

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function campaignCoverSrc(coverImage: string | null | undefined): string | null {
  if (coverImage == null || String(coverImage).trim() === "") return null;
  const raw = String(coverImage).trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const rel = toStorageRelativePath(raw);
  if (rel) return `/api/files/${rel}`;
  if (raw.startsWith("/")) return raw;
  return `/api/files/${raw.replace(/^\/+/, "")}`;
}

type CorporateDashboardData = {
  totalInvested: number;
  activePartnerships: number;
  connections: number;
  impactScore: number;
  campaignTypes: { CampaignTypeId: number; Type: string }[];
  campaigns: Array<{
    CampaignId: number;
    CampaignName: string | null;
    CoverImage: string | null;
    GoalAmount: number | null;
    Raised: number;
    Status: string | null;
    Type: string | null;
  }>;
};

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
      <CampaignCardSkeleton />
      <CampaignCardSkeleton />
      <CampaignCardSkeleton />
    </>
  );
}

export default function CorporateDashboard() {
  const { data: session } = useSession();
  const displayName = session?.user?.name?.trim() ?? "";

  const [dashboard, setDashboard] = useState<CorporateDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [moreFilter, setMoreFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("recent");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/corporateDashboard");
        const result = await response.json();
        if (!cancelled && response.ok && result?.success) {
          setDashboard(result.data as CorporateDashboardData);
        }
      } catch {
        // keep fallback empty UI
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    const campaigns = dashboard?.campaigns ?? [];
    const normalizeSearch = searchQuery.toLowerCase().trim();
    return campaigns.filter((campaign) => {
      const matchCategory = !categoryQuery || campaign.Type === categoryQuery;
      const matchSearch =
        !normalizeSearch ||
        String(campaign.CampaignName ?? "").toLowerCase().includes(normalizeSearch) ||
        String(campaign.Type ?? "").toLowerCase().includes(normalizeSearch);
      return matchCategory && matchSearch;
    });
  }, [dashboard?.campaigns, searchQuery, categoryQuery]);

  const visibleCampaigns = useMemo(() => {
    const statusFiltered =
      statusFilter === "all"
        ? filteredCampaigns
        : filteredCampaigns.filter(
            (campaign) =>
              String(campaign.Status ?? "").toLowerCase() ===
              statusFilter.toLowerCase(),
          );

    return [...statusFiltered].sort((a, b) => {
      const goalA = Number(a.GoalAmount ?? 0);
      const goalB = Number(b.GoalAmount ?? 0);
      const raisedA = Number(a.Raised ?? 0);
      const raisedB = Number(b.Raised ?? 0);

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
          return Number(b.CampaignId) - Number(a.CampaignId);
      }
    });
  }, [filteredCampaigns, statusFilter, orderFilter]);

  return (
    <>
      <Navbar />
      <main className="flex gap-4 flex-col max-w-[1200px] mx-auto mt-[18px] mb-[60px] px-[16px]">
        <section className="mt-4 flex items-center justify-between gap-3">
          <h1 className="m-0 text-[28px] font-extrabold tracking-tight text-[#0b0f19]">
            Welcome Back{displayName ? `, ${displayName}` : ""}
          </h1>
          <div className="flex flex-row gap-2">
            <Link href="/favourites">
              <button
                type="button"
                className="border border-black/10 bg-white rounded-xl px-4 py-3 cursor-pointer font-extrabold text-[#0b0f19] flex items-center gap-2 transition-transform transition-bg duration-100 active:translate-y-px"
              >
                <FontAwesomeIcon icon={faStar} className="mr-2" size="lg" />
                Favourite
              </button>
            </Link>
            <Link href="/search">
              <button
                type="button"
                className="border border-black/10 bg-Yellow rounded-xl px-4 py-3 cursor-pointer font-extrabold text-[#0b0f19] flex items-center gap-2 transition-transform transition-bg duration-100 active:translate-y-px"
              >
                <FontAwesomeIcon icon={faSearch} className="mr-2" size="lg" />
                Find New Campaigns
              </button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <LoadingQuickData />
          ) : (
            <>
              <DashboardDataCard
                title="Total Invested"
                data={formatGBP(dashboard?.totalInvested ?? 0)}
              />
              <DashboardDataCard
                title="Active Partnerships"
                data={String(dashboard?.activePartnerships ?? 0)}
              />
              <DashboardDataCard
                title="Connections"
                data={String(dashboard?.connections ?? 0)}
              />
              <DashboardDataCard
                title="Impact Score"
                data={String(dashboard?.impactScore ?? 0)}
              />
            </>
          )}
        </section>

        <section className="mt-[16px] flex gap-[10px] items-center max-sm:flex-col max-sm:items-stretch">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-[12px] rounded-[14px] border border-[rgba(11,15,25,0.12)] bg-white outline-none shadow-[0_10px_26px_rgba(11,15,25,0.05)] focus:border-[rgba(11,15,25,0.25)] focus:shadow-[0_0_0_4px_rgba(254,216,87,0.35),_0_10px_26px_rgba(11,15,25,0.05)]"
            placeholder="Search campaigns..."
          />
          <select
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
            className="p-[12px] rounded-[14px] border border-[rgba(11,15,25,0.12)] bg-white min-w-[180px] max-sm:min-w-0 outline-none shadow-[0_10px_26px_rgba(11,15,25,0.05)] focus:border-[rgba(11,15,25,0.25)] focus:shadow-[0_0_0_4px_rgba(254,216,87,0.35),_0_10px_26px_rgba(11,15,25,0.05)]"
          >
            <option value="">All Campaigns</option>
            {(dashboard?.campaignTypes ?? []).map((campaignType) => (
              <option
                key={campaignType.CampaignTypeId}
                value={campaignType.Type}
              >
                {campaignType.Type}
              </option>
            ))}
          </select>
          <button
            className="border border-[rgba(11,15,25,0.14)] bg-white rounded-[12px] py-[10px] px-[12px] cursor-pointer font-extrabold text-[#0b0f19] transition-all duration-[120ms] ease-in-out active:translate-y-[1px]"
            type="button"
            onClick={() => setMoreFilter((prev) => !prev)}
            aria-expanded={moreFilter}
            aria-controls="more-filters-panel"
          >
            {moreFilter ? "Hide Filters" : "More Filters"}
          </button>
        </section>

        {moreFilter && (
          <section id="more-filters-panel" className="flex justify-end w-full">
            <div className="flex justify-end gap-4 w-fit rounded-2xl mt-2 p-4 bg-[rgba(254,216,87,0.4)]">
              <div>
                <label htmlFor="status" className="px-2">
                  Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  name="status"
                  id="status"
                  className="rounded-2xl bg-gray-200 py-1 px-3 capitalize outline-none"
                >
                  <option value="all">All</option>
                  {[...new Set((dashboard?.campaigns ?? []).map((campaign) => campaign.Status))]
                    .filter((status): status is string => Boolean(status && status !== ""))
                    .map((status) => (
                      <option key={status} value={status} className="capitalize">
                        {status}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="order" className="px-2">
                  Order By:
                </label>
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  name="order"
                  id="order"
                  className="rounded-2xl bg-gray-200 py-1 px-3 capitalize outline-none"
                >
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

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <LoadingCampaignCards />
          ) : visibleCampaigns.length === 0 ? (
            <div className="col-span-full py-10 text-center text-[#0b0f19]/70 font-medium">
              <p className="m-0 mb-2">No partnered campaigns yet.</p>
              <Link
                href="/search"
                className="font-extrabold text-[#0b0f19] underline"
              >
                Discover campaigns to support
              </Link>
            </div>
          ) : (
            visibleCampaigns.map((c) => {
              return (
                <DashboardCampaignCard
                  key={c.CampaignId}
                  title={c.CampaignName || "Campaign"}
                  category={c.Type || "—"}
                  raised={c.Raised}
                  goal={c.GoalAmount ?? 0}
                  status={c.Status || "open"}
                  href={`/campaign?id=${c.CampaignId}`}
                  coverImageUrl={campaignCoverSrc(c.CoverImage)}
                />
              );
            })
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
