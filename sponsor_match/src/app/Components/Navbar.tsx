"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const closeAllMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
    setMobileSearchOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = searchQuery.trim();
    closeAllMenus();

    if (!trimmed) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleMenuToggle = () => {
    if (!isMobile) return;
    setMenuOpen((prev) => !prev);
    setAccountOpen(false);
    setMobileSearchOpen(false);
  };

  const handleAccountToggle = () => {
    if (!isMobile) return;
    setAccountOpen((prev) => !prev);
    setMenuOpen(false);
    setMobileSearchOpen(false);
  };

  const handleMobileSearchToggle = () => {
    if (!isMobile) return;
    setMobileSearchOpen((prev) => !prev);
    setMenuOpen(false);
    setAccountOpen(false);
  };

  return (
    <div className="navbarShell">
      <div className="navbarInner">
        <div className="group relative navbarLeft">
          <button
            type="button"
            className="navTrigger"
            onClick={handleMenuToggle}
            aria-label="Open navigation menu"
          >
            <div className={`hamburger ${menuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <img
              src="/Logo1.png"
              alt="Funding Logo"
              width={175}
              height={175}
              className="navbarLogo"
            />
          </button>

          <div
            className={`navDropdown navDropdownLeft ${menuOpen ? "open" : ""}`}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="navDropdownCard"
            >
              <p className="navDropdownTitle">Menu</p>

              <Link
                href="/dashboard"
                className="navDropdownLink"
                onClick={closeAllMenus}
              >
                Dashboard
              </Link>
              <Link
                href="/myaccount"
                className="navDropdownLink"
                onClick={closeAllMenus}
              >
                My Account
              </Link>
              <Link
                href="/newcampaign"
                className="navDropdownLink"
                onClick={closeAllMenus}
              >
                Create Campaign
              </Link>
              <Link
                href="/campaign"
                className="navDropdownLink"
                onClick={closeAllMenus}
              >
                My Campaign
              </Link>
              <Link
                href="/favourites"
                className="navDropdownLink"
                onClick={closeAllMenus}
              >
                Favourites
              </Link>
              <Link
                href="/"
                className="navDropdownLink logoutLink"
                onClick={closeAllMenus}
              >
                Logout
              </Link>
            </div>
          </div>
        </div>

        <div className="navbarTitleWrap">
          <Link href="/" className="navbarTitle font-Heading">
            SponsorMatch
          </Link>
        </div>

        <div className="navbarRight">
          <form className="navbarSearch desktopSearch" onSubmit={handleSearch}>
            <input
              type="text"
              className="navbarSearchInput"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search campaigns"
            />
            <button
              type="submit"
              className="navbarSearchButton"
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </form>

          <div className="mobileSearchWrap">
            <button
              type="button"
              className="navbarSearchButton mobileSearchButton"
              onClick={handleMobileSearchToggle}
              aria-label="Open search"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>

            {mobileSearchOpen && (
              <form className="mobileSearchDropdown" onSubmit={handleSearch}>
                <input
                  type="text"
                  className="mobileSearchInput"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="mobileSearchSubmit">
                  Search
                </button>
              </form>
            )}
          </div>

          <div className="group relative">
            <button
              type="button"
              className="profileButton"
              onClick={handleAccountToggle}
              aria-label="Open account menu"
            >
              <FontAwesomeIcon icon={faCircleUser} className="profileIcon" />
            </button>

            <div
              className={`navDropdown navDropdownRight ${
                accountOpen ? "open" : ""
              }`}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="navDropdownCard"
              >
                <p className="navDropdownTitle">Account</p>

                <Link
                  href="/myaccount"
                  className="navDropdownLink"
                  onClick={closeAllMenus}
                >
                  My Account
                </Link>
                <Link
                  href="/"
                  className="navDropdownLink logoutLink"
                  onClick={closeAllMenus}
                >
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}