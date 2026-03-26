"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { toStorageRelativePath } from "@/lib/storagePaths";
import "./Navbar.css";

type NavbarAccount = {
  AccountTypeId?: number | string;
  logo?: string;
};

/** Turn DB `CompanyLogo` (relative storage or absolute URL) into a usable `img` src. */
function resolveLogoImageSrc(stored: string | null | undefined): string | null {
  if (stored == null || String(stored).trim() === "") return null;
  const raw = String(stored).trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/api/files/")) return raw;
  if (raw.startsWith("/")) return raw;
  const relative = toStorageRelativePath(raw);
  return relative ? `/api/files/${relative}` : null;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<NavbarAccount | null>(null);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchAccountData = async () => {
      try {
        const res = await fetch("/api/getAccountData");
        const data = await res.json();

        const account = data.data?.[0];

        if (data.success && account) {
          setUserData(account);
        }
      } catch {
        console.log("Failed to fetch user role");
      }
    };

    fetchAccountData();

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLogoLoadFailed(false);
  }, [userData?.logo]);

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
  const accountTypeId = userData?.AccountTypeId;
  const dashboardHref =
    accountTypeId === 1 || accountTypeId === "1"
      ? "/Corporate/dashboard"
      : "/VCSE/dashboard";
  const profileLogoSrc = resolveLogoImageSrc(userData?.logo);

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
                  href={dashboardHref}
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
                href={dashboardHref}
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
          <h1 className="navbarTitle font-Heading">
            SponsorMatch
          </h1>
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
              {profileLogoSrc && !logoLoadFailed ? (
                <img
                  src={profileLogoSrc}
                  alt="Profile"
                  className="profileIcon"
                  onError={() => setLogoLoadFailed(true)}
                />
              ) : (
                <FontAwesomeIcon icon={faCircleUser} className="profileIcon" />
              )}
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