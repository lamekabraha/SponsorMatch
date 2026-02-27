"use client";

import "./favourites.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

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

const campaigns: Campaign[] = [
  {
    id: "1",
    title: "Basketball Community",
    org: "Sports For All",
    category: "Sports",
    deadline: "11/03/2026",
    raised: 2000,
    goal: 5000,
    imageUrl: "/campaigns/basketball.jpg",
  },
  {
    id: "2",
    title: "Coding Team",
    org: "Tech Made Easy",
    category: "Education",
    deadline: "11/14/2023",
    raised: 4500,
    goal: 10000,
    imageUrl: "/campaigns/coding.jpg",
  },
  {
    id: "3",
    title: "Homeless Support Initiative",
    org: "Shelter Plus",
    category: "Poverty Relief",
    deadline: "11/03/2026",
    raised: 2000,
    goal: 5000,
    imageUrl: "/campaigns/homeless.jpg",
  },
];

const FAV_KEY = "sponsorMatch:favourites";

function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
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
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 17.3l-6.18 3.7 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62 7.19.62-5.46 4.73 1.64 7.03z"
        fill={filled ? "#fed857" : "none"}
        stroke="#0b0f19"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FavouritesPage() {
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    setFavIds(readFavs());
  }, []);

  const favCampaigns = useMemo(
    () => campaigns.filter((c) => favIds.includes(c.id)),
    [favIds]
  );

  function removeFav(id: string) {
    setFavIds((prev) => {
      const next = prev.filter((x) => x !== id);
      writeFavs(next);
      return next;
    });
  }

  return (
    <><Navbar />
    <div className="favPage">
      
      <Footer />

      <main className="favContainer">
        <div className="favTop">
          <div>
            <h1 className="favTitle">Your Favourites</h1>
            <p className="favSubtitle">Campaigns you've favourited will be here.</p>
          </div>

          <Link href="/dashboard" className="favBack">
            ← Back to Dashboard
          </Link>
        </div>

        {favCampaigns.length === 0 ? (
          <div className="emptyCard">
            <div className="emptyTitle">No favourites yet</div>
            <div className="emptyText">
              Go to your dashboard and favourite a page to view it here.
            </div>
            <Link href="/dashboard" className="emptyBtn">
              Browse Campaigns
            </Link>
          </div>
        ) : (
          <section className="favGrid">
            {favCampaigns.map((c) => (
              <article key={c.id} className="favCard">
                <div className="favImage">
                  <img src={c.imageUrl} alt={c.title} />
                  <button
                    type="button"
                    className="favStar"
                    onClick={() => removeFav(c.id)}
                    title="Remove from favourites"
                    aria-label="Remove from favourites"
                  >
                    <StarIcon filled />
                  </button>
                  <span className="favGoal">Goal: {formatGBP(c.goal)}</span>
                </div>

                <div className="favBody">
                  <div className="favMeta">
                    <span className="favPill">{c.category}</span>
                    <span className="favDeadline">Deadline: {c.deadline}</span>
                  </div>

                  <h3 className="favCardTitle">{c.title}</h3>
                  <div className="favOrg">{c.org}</div>

                  <div className="favInfo">
                    <span>Raised: {formatGBP(c.raised)}</span>
                    <span>Goal: {formatGBP(c.goal)}</span>
                  </div>

                  <div className="favActions">
                    <Link href="/campaign" className="favBtn">
                      Read More
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
    </>
  );
}
