"use client";

import "./dashboard.css";
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
    <div className="page">
      <Navbar />
      <Footer />
      <main className="container">
        <section className="banner">
          <div className="bannerLeft">
            <span className="bannerValue">Currently viewing as</span>
            <strong className="bannerStrong">VCSE</strong>
          </div>

          <Link
            href="/favourites"
            className="btn btnGhost"
            style={{ textDecoration: "none", fontWeight: 900 }}
          >
            ★ Favourites ({favCount})
          </Link>
        </section>

        <section className="titleRow">
          <h1 className="title">Your Campaigns Dashboard</h1>
          <button className="btn btnPrimary">＋ Create Campaign</button>
        </section>

        <section className="statsGrid">
          <div className="statCard">
            <div className="statLabel">Total Raised</div>
            <div className="statValue">{formatGBP(8500)}</div>
          </div>
          <div className="statCard">
            <div className="statLabel">Active Campaigns</div>
            <div className="statValue">3</div>
          </div>
          <div className="statCard">
            <div className="statLabel">Connections</div>
            <div className="statValue">12</div>
          </div>
          <div className="statCard">
            <div className="statLabel">Avg. Engagement</div>
            <div className="statValue">87%</div>
          </div>
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
          {campaigns.map((c) => {
            const progress = pct(c.raised, c.goal);
            const needed = Math.max(0, c.goal - c.raised);
            const isFav = favs.includes(c.id);

            return (
              <article key={c.id} className="card">
                <div className="cardImage">
                  <img src={c.imageUrl} alt={c.title} />

                  <button
                    type="button"
                    onClick={() => toggleFav(c.id)}
                    aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                    title={isFav ? "Unfavourite" : "Favourite"}
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      border: "1px solid rgba(11,15,25,0.16)",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(6px)",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      boxShadow: "0 10px 22px rgba(11,15,25,0.12)",
                    }}
                  >
                    <StarIcon filled={isFav} />
                  </button>

                  <span className="goalPill">Goal: {formatGBP(c.goal)}</span>
                </div>

                <div className="cardBody">
                  <div className="cardMeta">
                    <span className="pill">{c.category}</span>
                    <span className="deadline">Deadline: {c.deadline}</span>
                  </div>

                  <h3 className="cardTitle">{c.title}</h3>
                  <div className="cardOrg">{c.org}</div>

                  <div className="budgetInfo">
                    <span>Raised: {formatGBP(c.raised)}</span>
                    <span>Goal: {formatGBP(c.goal)}</span>
                    <span className="needed">Still Needed: {formatGBP(needed)}</span>
                  </div>

                  <div className="cardActions">
                    {c.id === "1" ? (
                      <Link href="/campaign" className="btn btnDark">
                        Read More
                      </Link>
                    ) : (
                      <button type="button" className="btn btnDark">
                        Read More
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
