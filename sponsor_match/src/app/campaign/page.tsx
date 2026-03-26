"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import CampaignPreviewTemplate from "../Components/CampaignPreviewTemplate";
import type { CampaignPreviewPackage } from "../Components/CampaignPreviewTemplate";

type CampaignPreviewData = {
  name: string;
  orgName?: string;
  location?: string | null;
  type?: string;
  desc?: string;
  summary?: string;
  goal: number;
  raised?: number | null;
  coverImageUrl?: string | null;
  websiteUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  additionalImageUrls?: string[];
  packages?: CampaignPreviewPackage[];
};

export default function CampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = useMemo(() => {
    const raw = searchParams.get("id") ?? searchParams.get("campaignId");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : NaN;
  }, [searchParams]);

  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CampaignPreviewData | null>(null);

  useEffect(() => {
    if (!Number.isFinite(campaignId) || campaignId <= 0) {
      setLoadState("error");
      setError("Missing or invalid campaign id.");
      return;
    }

    let cancelled = false;
    setLoadState("loading");
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/campaign?id=${campaignId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.error || "Failed to load campaign");
        }
        if (cancelled) return;
        setData(json.data as CampaignPreviewData);
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load campaign");
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const handleCloseCampaign = async () => {
    if (!Number.isFinite(campaignId) || campaignId <= 0) return;
    if (typeof window === "undefined") return;
    const ok = window.confirm("Close this campaign? This will hide it as open.");
    if (!ok) return;

    const res = await fetch("/api/campaign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      window.alert(json?.error || "Failed to close campaign");
      return;
    }
    router.push("/VCSE/dashboard");
    router.refresh();
  };

  if (loadState === "error" && !data) {
    return (
      <>
        <Navbar />
        <main className="nc-create-main">
          <section className="nc-panel">
            <p className="m-0 mb-3">{error ?? "Could not load this campaign."}</p>
            <button
              className="nc-btn nc-btn-primary"
              type="button"
              onClick={() => router.push("/VCSE/dashboard")}
            >
              Back to dashboard
            </button>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (loadState === "loading" || !data) {
    return (
      <>
        <Navbar />
        <main className="nc-create-main">
          <section className="nc-panel">
            <p className="m-0">Loading campaign...</p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CampaignPreviewTemplate
        prevData={data}
        isLivePreview={false}
        backHref="/VCSE/dashboard"
        editHref={`/editcampaign?id=${campaignId}`}
        showCloseCampaign
        onCloseCampaign={handleCloseCampaign}
      />
      <Footer />
    </>
  );
}
