"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import CampaignCardSkeleton from "../Components/dashboardSkeletonCampaignCards";
import { DashboardCampaignCard } from "../Components/DashboardCampaignCard";

type Campaign = {
  id: string;
  title: string;
  org: string;
  category: string;
  deadline: string;
  raised: number;
  goal: number;
  imageUrl: string;
};

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function SearchPage() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState<number>(20000);
  const [distance, setDistance] = useState("any");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [layoutKey, setLayoutKey] = useState(0);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);

    const raf = requestAnimationFrame(() => setLayoutKey((k) => k + 1));
    return () => cancelAnimationFrame(raf);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        const trimmed = query.trim();
        if (trimmed) params.set("q", trimmed);
        if (selectedCategories.length > 0)
          params.set("categories", selectedCategories.join(","));
        params.set("maxBudget", String(maxBudget));
        params.set("distance", String(distance));

        const res = await fetch(`/api/search?${params.toString()}`);
        const json = await res.json();

        if (!cancelled && res.ok && json?.success) {
          setCampaigns(json.data?.campaigns ?? []);
          setCategories(json.data?.categories ?? []);
          setLayoutKey((k) => k + 1);
        }

        if (!cancelled && (!res.ok || !json?.success)) {
          setCampaigns([]);
          setCategories([]);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to search");
          setCampaigns([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, selectedCategories, maxBudget, distance]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return campaigns.filter((c) => {
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.org.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(c.category);

      const matchesBudget = c.goal <= maxBudget;

      return matchesQuery && matchesCategory && matchesBudget;
    });
  }, [campaigns, query, selectedCategories, maxBudget]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]
    );
  }

  function resetFilters() {
    setSelectedCategories([]);
    setMaxBudget(20000);
    setDistance("any");
  }

  return (
    <div className="min-h-screen bg-white text-[#0b1324]">
      <Navbar />

      <main className="mt-[52px] mx-auto max-w-[1200px] px-4 pb-20 pt-6">
        <section className="rounded-2xl border border-black/10 bg-[#fffdf2] p-5 shadow-[0_10px_26px_rgba(11,15,25,0.06)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Search Campaigns
              </h1>
              <p className="mt-1 text-sm font-semibold text-black/60">
                Search by name, organisation, or category.
              </p>
            </div>

            <div className="w-full md:w-auto">
              {query ? (
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-semibold shadow-[0_10px_26px_rgba(11,15,25,0.05)]">
                  Showing results for:{" "}
                  <span className="font-extrabold text-black">"{query}"</span>
                </div>
              ) : (
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 font-semibold text-black/50 shadow-[0_10px_26px_rgba(11,15,25,0.05)]">
                  Use the box above to search for campaigns.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-black/10 bg-[#fed857] p-5 shadow-[0_10px_26px_rgba(11,15,25,0.06)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Filters</h2>
              <button
                onClick={resetFilters}
                className="rounded-xl bg-black px-3 py-1.5 text-sm font-extrabold text-white hover:bg-white hover:text-black border border-black"
              >
                Reset
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-sm font-extrabold">Category</div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="accent-Black text-White h-4 w-4"
                    />
                    <span className="font-semibold">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold">Max Budget</span>
                <span className="w-24 text-right text-sm font-extrabold tabular-nums">
                  {formatGBP(maxBudget)}
                </span>
              </div>

              <input
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="mt-3 accent-Black w-full"
              />

              <div className="mt-1 flex justify-between text-xs font-bold">
                <span>£1,000</span>
                <span>£20,000</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-sm font-extrabold">Distance</div>
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 font-bold"
              >
                <option value="any">Any distance</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="20">Within 20 miles</option>
                <option value="50">Within 50 miles</option>
              </select>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Results</h2>
              <div className="text-sm font-bold text-black/60">
                {filtered.length} campaign{filtered.length !== 1 && "s"} found
              </div>
            </div>

            {isLoading ? (
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 4xl:grid-cols-3">
                <CampaignCardSkeleton />
                <CampaignCardSkeleton />
                <CampaignCardSkeleton />
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-6 shadow">
                No campaigns match your search or filters.
              </div>
            ) : (
              <div
                key={layoutKey}
                className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 4xl:grid-cols-3"
              >
                {filtered.map((c) => {
                  return (
                    <div
                      key={c.id}
                      className="transition hover:-translate-y-1"
                    >
                      <DashboardCampaignCard
                        title={c.title}
                        category={c.category}
                        raised={c.raised}
                        goal={c.goal}
                        status="open"
                        coverImageUrl={
                          c.imageUrl
                            ? `/api/files/${c.imageUrl}`
                            : `/loadingImage.jpg`
                        }
                        href={`/campaign?id=${c.id}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}