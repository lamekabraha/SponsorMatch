"use client";

import { useState } from "react";
import "./dashboard.css";
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

export default function DashboardPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleCard = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="page">
      <Navbar />
      <Footer />
      <main className="container">
        {}
        <section className="banner">
          <div className="bannerLeft">
            <span className="bannerValue">Currently viewing as</span>
            <strong className="bannerStrong">VCSE</strong>
          </div>
        </section>

        {}
        <section className="titleRow">
          <h1 className="title">Your Campaigns Dashboard</h1>
          <button className="btn btnPrimary">＋ Create Campaign</button>
        </section>

        {}
        <section className="statsGrid">
          <div className="statCard">
            <div className="statLabel">Total Raised</div>
            <div className="statValue">{formatGBP(9700)}</div>
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

        {}
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

        {}
        <section className="grid">
          {campaigns.map((c) => {
            const progress = pct(c.raised, c.goal);
            const needed = Math.max(0, c.goal - c.raised);
            const isOpen = openId === c.id;

            return (
              <article
                key={c.id}
                className={`card ${isOpen ? "cardExpanded" : ""}`}
              >
<div className="cardImage">

  <img src={c.imageUrl} alt={c.title} />

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
                    <span className="needed">
                      Still Needed: {formatGBP(needed)}
                    </span>
                  </div>


                  {isOpen && (
                    <div className="expandedContent">
                      <p>
                        We are raising funds to support a good cause.
                      </p>
                    </div>
                  )}

                  <div className="cardActions">
                    <button
                      type="button"
                      className="btn btnDark"
                      onClick={() => toggleCard(c.id)}
                    >
                      {isOpen ? "Close" : "Read More"}
                    </button>
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
