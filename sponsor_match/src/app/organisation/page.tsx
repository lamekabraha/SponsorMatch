"use client";

import "./organisation.css";
import Link from "next/link";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function OrganisationPage() {
  return (
    <>
      <Navbar />

      <div className="org-profile-page">
        <main className="org-profile-container">
          <section className="org-hero-shell">
            <div className="org-banner" />

            <div className="org-header-card">
              <div className="org-avatar-large">SF</div>

              <div className="org-header-info">
                <div className="org-header-top">
                  <div>
                    <h1>Sports For All</h1>
                    <p className="org-category">Community Sports Organisation</p>
                    <p className="org-location">Manchester, UK</p>
                  </div>

                  <div className="org-actions">
                    <button className="follow-btn">Follow</button>
                    <button className="message-btn">Message</button>
                  </div>
                </div>

                <p className="org-bio">
                  Sports For All supports inclusive sports initiatives designed
                  to create safe, active spaces for young people and local
                  communities.
                </p>

                <div className="org-stats">
                  <div className="stat-box">
                    <strong>1</strong>
                    <span>Campaigns</span>
                  </div>
                  <div className="stat-box">
                    <strong>3.2k</strong>
                    <span>Followers</span>
                  </div>
                  <div className="stat-box">
                    <strong>18</strong>
                    <span>Sponsors</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="org-main-grid">
            <div className="org-left">
              <div className="profile-card">
                <h2>About</h2>
                <p>
                  Our mission is to make sport more accessible for everyone.
                  Through sponsorship and local support, we create better spaces
                  for young people to play, train, and grow.
                </p>
              </div>

              <div className="profile-card">
                <h2>Active Campaigns</h2>

                <Link href="/campaign" className="campaign-preview">
                  <div>
                    <strong>Basketball Community</strong>
                    <p>Raising funds for courts, kits, and coaching.</p>
                  </div>
                  <span>40% funded</span>
                </Link>
              </div>
            </div>

            <aside className="org-right">
              <div className="profile-card">
                <h2>Connect</h2>

                <div className="socials-row">
                  <a
                    href="https://www.instagram.com/fundingiukire/"
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <img src="/instagram.png" alt="Instagram" />
                  </a>

                  <a
                    href="https://www.tiktok.com/@fundingi?_t=8oqECv4W0X2&_r=1"
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn"
                    aria-label="TikTok"
                    title="TikTok"
                  >
                    <img src="/tiktok.png" alt="TikTok" />
                  </a>

                  <a
                    href="mailto:hello@sportsforall.org"
                    className="social-btn social-text-btn"
                    aria-label="Email"
                    title="Email"
                  >
                    ✉
                  </a>

                  <a
                    href="tel:+441234567890"
                    className="social-btn social-text-btn"
                    aria-label="Phone"
                    title="Phone"
                  >
                    ☎
                  </a>
                </div>

                <div className="contact-details">
                  <p>
                    <strong>Email:</strong> hello@sportsforall.org
                  </p>
                  <p>
                    <strong>Phone:</strong> +44 1234 567890
                  </p>
                </div>

                <button className="full-contact-btn">
                  Contact Organisation
                </button>
              </div>
            </aside>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}