import Navbar from "@/app/Components/Navbar";
import Link from "next/link";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DashboardDataCard } from "@/app/Components/DashboardDataCard";
import { DashboardCampaignCard } from "@/app/Components/DashboardCampaignCard";
import Footer from "@/app/Components/Footer";
import { getSession } from "@/lib/server-session";
import { loadCorporateDashboardData } from "@/app/api/corporateDashboard/route";
import { redirect } from "next/navigation";
import { toStorageRelativePath } from "@/lib/storagePaths";

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

export default async function CorporateDashboard() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const accountId = (session.user as { accountId?: number }).accountId;
  if (accountId == null) {
    redirect("/login");
  }

  const accountTypeId = (session.user as { accountTypeId?: number })
    .accountTypeId;
  if (accountTypeId === 2) {
    redirect("/VCSE/dashboard");
  }

  let dashboard;
  try {
    dashboard = await loadCorporateDashboardData(accountId);
  } catch {
    dashboard = {
      totalInvested: 0,
      activePartnerships: 0,
      connections: 0,
      impactScore: 0,
      campaigns: [],
    };
  }

  const userName = session.user.name?.trim() || "there";

  return (
    <>
      <Navbar />
      <main className="flex gap-4 flex-col max-w-[1200px] mx-auto mt-[18px] mb-[60px] px-[16px]">
        <section className="mt-4 flex items-center justify-between gap-3">
          <h1 className="m-0 text-[28px] font-extrabold tracking-tight text-[#0b0f19]">
            Welcome Back, {userName}
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
          <DashboardDataCard
            title="Total Invested"
            data={formatGBP(dashboard.totalInvested)}
          />
          <DashboardDataCard
            title="Active Partnerships"
            data={String(dashboard.activePartnerships)}
          />
          <DashboardDataCard
            title="Connections"
            data={String(dashboard.connections)}
          />
          <DashboardDataCard
            title="Impact Score"
            data={String(dashboard.impactScore)}
          />
        </section>

        <section className="flex justify-end gap-4">
          <input
            type="text"
            placeholder="Search (coming soon)"
            className="border border-black/10 bg-white rounded-xl px-4 py-3 font-extrabold text-[#0b0f19]"
          />
          <select name="filter" id="filter" className="border border-black/10 bg-white rounded-xl px-4 py-3 cursor-pointer font-bold text-black" defaultValue="all">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard.campaigns.length === 0 ? (
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
            dashboard.campaigns.map((c) => {
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
