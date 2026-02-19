"use client";
import "./campaign.css";
import Link from "next/link";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function Page() {
  return (
    <><Navbar />
    <div className="campaign-page">
      <main>
        <section className="page-container">
          <div className="hero-card">
            <div className="hero-image">
              <Link href="/dashboard" className="back-btn">
                ← Back
              </Link>
              <Link href="/editcampaign" className="edit-btn">
              <button className="Edit-btn">Edit Campaign</button>
              </Link>
            </div>
            <div className="hero-content">
              <h1>Basketball Community</h1>
              <p className="org">by Sports For All</p>

              <div className="hero-meta">
                <span className="chip">Sports</span>
                <span>Manchester, UK</span>
              </div>
            </div>
          </div>

          <div className="content-grid">
            <div className="left-column">
              <div className="panel">
                <h2>About this campaign</h2>
                <p>
                  The Basketball Community campaign wants to give young people in
                  nearby areas access to safe courts, training sessions, and
                  equipment. Through sport, the goal is to encourage cooperation,
                  good health, and constructive engage with the community.
                </p>
                <p>
                  Sponsorship helps funding basketball hoops, training kits,
                  coaching sessions, and tournaments that bring people together
                  and create long-term opportunities and memories.
                </p>

                <div className="info-row">
                  <span> Deadline: 11/03/2026</span>
                  <span> Expected Reach: 5,000 people</span>
                </div>
              </div>

              <div className="panel">
                <h2>Sponsorship Packages</h2>

                <div className="package">
                  <label>
                    <input type="radio" name="package" />
                    Bronze — £500
                  </label>
                  <ul>
                    <li>Logo on campaign page</li>
                    <li>Social media acknowledgement (2 posts)</li>
                    <li>Name on donors board</li>
                    <li>Invitation to community event</li>
                  </ul>
                </div>

                <div className="package">
                  <label>
                    <input type="radio" name="package" />
                    Silver — £1000
                  </label>
                  <ul>
                    <li>Medium logo placement on materials</li>
                    <li>Social media highlights</li>
                    <li>Logo on event banners</li>
                    <li>Certificate of appreciation</li>
                  </ul>
                </div>

                <div className="package">
                  <label>
                    <input type="radio" name="package" />
                    Gold — £2000
                  </label>
                  <ul>
                    <li>Primary sponsor placement</li>
                    <li>Dedicated social media feature</li>
                    <li>Logo on team jerseys</li>
                    <li>VIP invitation to tournaments</li>
                  </ul>
                </div>
              </div>
            </div>

            <aside className="right-column">
              <div className="panel progress-panel">
                <h2>Campaign Progress</h2>

                <h3>£2000</h3>
                <p className="target">of £5000 target</p>

                <div className="progress-bar">
                  <div className="progress-fill" />
                </div>

                <span className="funded">40% funded</span>

                <div className="split">
                  <div>
                    <small>Deadline</small>
                    <p>01/05/2026</p>
                  </div>
                  <div>
                    <small>Location</small>
                    <p>Sheffield, UK</p>
                  </div>
                </div>
              </div>

              <div className="panel org-panel">
                <h2>About the Organisation</h2>

                <div className="org-head">
                  <div className="avatar">SF</div>
                  <div>
                    <strong>Sports For All</strong>
                    <p>Community Sports Organisation</p>
                  </div>
                </div>

                <p className="org-text">
                  Sports For All supports inclusive sports initiatives designed to
                  create safe, active spaces for young people and communities.
                </p>

                <button className="contact-btn">Contact Organisation</button>
              </div>
            </aside>
            <button className="clear-btn mb-4">Close Campaign</button>
          </div>
        </section>
        
      </main>
      <Footer />
    </div>
    </>
  );
}
