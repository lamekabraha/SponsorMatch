"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "@/app/campaign/campaign.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { toStorageRelativePath } from "@/lib/storagePaths";

export type CampaignPreviewPackage = {
    packageType?: string;
    title: string;
    price: number;
    /** Human-readable benefit lines for display */
    benefitLines?: string[];
    benefitIds?: number[];
};

interface CampaignPreviewProps{
    prevData: {
        name: string;
        orgName?: string;
        location?: string | null | undefined;
        type?: string;
        desc?: string;
        goal: number;
        raised?: number | null | undefined;
        coverImageUrl?: string | null;
        websiteUrl?: string;
        instagramUrl?: string;
        twitterUrl?: string;
        facebookUrl?: string;
        linkedinUrl?: string;
        additionalImageUrls?: string[];
        packages?: CampaignPreviewPackage[];
    };
    isLivePreview?: boolean;
    /** Public campaign page: top-left link (e.g. `/VCSE/dashboard`) */
    backHref?: string;
    /** Public campaign page: top-right link (e.g. `/editcampaign?id=…`) */
    editHref?: string;
    /** Show “Close campaign” under the main grid (e.g. VCSE owner view) */
    showCloseCampaign?: boolean;
    onCloseCampaign?: () => void | Promise<void>;
}

export default function CampaignPreviewTemplate({
    prevData,
    isLivePreview,
    backHref,
    editHref,
    showCloseCampaign,
    onCloseCampaign,
}: CampaignPreviewProps){
    const progressPercentage = Math.min(100, Math.round(((prevData.raised ?? 0)/(prevData.goal || 1)) * 100));
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);

    const packages = prevData.packages ?? [];

    useEffect(() => {
        if (selectedPackageIndex >= packages.length) {
            setSelectedPackageIndex(0);
        }
    }, [packages.length, selectedPackageIndex]);

    const [accountData, setAccountData] = useState<any | null>(null);

    useEffect(() => {
        const fetchAccountData = async (): Promise<void> => {
            try {
                const response = await fetch("/api/getAccountData");
                const { success, data }: { success: boolean; data: any[] } = await response.json();
                if (!success) {
                    setAccountData(null);
                    return;
                }
                setAccountData(data?.[0] ?? null);
            } catch {
                setAccountData(null);
            }
        };
        fetchAccountData();
    }, []);

    const socialLinksFromPrev = useMemo(
        () =>
            [
                { key: "Website", url: prevData.websiteUrl, icon: faGlobe },
                { key: "Instagram", url: prevData.instagramUrl, icon: faInstagram },
                { key: "X", url: prevData.twitterUrl, icon: faTwitter },
                { key: "Facebook", url: prevData.facebookUrl, icon: faFacebook },
                { key: "LinkedIn", url: prevData.linkedinUrl, icon: faLinkedin },
            ].filter((item) => item.url && String(item.url).trim() !== ""),
        [
            prevData.websiteUrl,
            prevData.instagramUrl,
            prevData.twitterUrl,
            prevData.facebookUrl,
            prevData.linkedinUrl,
        ]
    );

    const socialLinksFromAccount = useMemo(() => {
        if (!accountData) return [];
        const w = String(accountData.Website ?? "").trim();
        const ig = String(accountData.Instagram ?? "").trim();
        const tw = String(accountData.Twitter ?? "").trim();
        const fb = String(accountData.Facebook ?? "").trim();
        const li = String(accountData.LinkedIn ?? "").trim();
        return [
            { key: "Website", url: w, icon: faGlobe },
            { key: "Instagram", url: ig, icon: faInstagram },
            { key: "X", url: tw, icon: faTwitter },
            { key: "Facebook", url: fb, icon: faFacebook },
            { key: "LinkedIn", url: li, icon: faLinkedin },
        ].filter((item) => item.url);
    }, [accountData]);

    /** Public page: fall back to account links when campaign has none */
    const socialLinks =
        !isLivePreview && socialLinksFromPrev.length === 0 && socialLinksFromAccount.length > 0
            ? socialLinksFromAccount
            : socialLinksFromPrev;

    const rawLogoValue =
        accountData?.logo ??
        accountData?.Logo ??
        accountData?.CompanyLogo ??
        accountData?.companyLogo ??
        null;

    const logoRelativePath = rawLogoValue ? toStorageRelativePath(String(rawLogoValue)) : null;

    const companyLogoSrc =
        rawLogoValue && (String(rawLogoValue).startsWith("http") || String(rawLogoValue).startsWith("/"))
            ? String(rawLogoValue)
            : logoRelativePath
            ? `/api/files/${logoRelativePath}`
            : "/placeholder-logo.png";

    const galleryImages = prevData.additionalImageUrls ?? [];
    const currentGalleryImage = galleryImages[galleryIndex] ?? null;

    useEffect(() => {
        if (galleryIndex >= galleryImages.length) {
            setGalleryIndex(0);
        }
    }, [galleryImages.length, galleryIndex]);

    return (
        <div className='campaign-page'>
            {isLivePreview && (
                <div className="bg-yellow-100 p-2 text-center border-b-2 border-yellow-400 font-bold text-sm">Live Preview Mode</div>
            )}
            <section className="page-container">
                <div className="hero-card">
                    <div style={{backgroundImage: `url(${prevData.coverImageUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc'})`}} className="hero-image">
                        {!isLivePreview && backHref ? (
                            <Link href={backHref} className="rounded-3xl bg-Yellow text-Black px-4 py-2 absolute top-4 left-4">
                                ← Back
                            </Link>
                        ) : null}
                        <div className="flex absolute top-4 right-4 gap-4">
                            {showCloseCampaign ? (
                                <button
                                    type="button"
                                    className="rounded-3xl bg-red-500 text-white px-4 py-2 "
                                    onClick={async () => {
                                        if (onCloseCampaign) {
                                            await onCloseCampaign();
                                            return;
                                        }
                                        if (
                                            typeof window !== "undefined" &&
                                            window.confirm(
                                                "Close this campaign? You can confirm details with your team before doing this for real."
                                            )
                                        ) {
                                            // Wire to PATCH /api/... when campaign close endpoint exists.
                                        }
                                    }}
                                >
                                    Close Campaign
                                </button>
                            ) : null}
                            {!isLivePreview && editHref ? (
                                <Link href={editHref} className="rounded-3xl bg-Yellow text-Black px-4 py-2 ">
                                    Edit Campaign
                                </Link>
                            ) : null}
                        </div>
                    </div>
                        <div className="hero-content">
                            <h1 className="text-Black">{prevData.name || 'Campaign Title'}</h1>
                            <div className="flex gap-2">
                                <img 
                                    src={companyLogoSrc}
                                    alt="Logo" 
                                    width={50} 
                                    height={50} 
                                    style={{ borderRadius: '50%' }}
                                />
                                <div className="hero-meta flex flex-col">
                                    <p className="org my-0 py-0">
                                        by{" "}
                                        {prevData.orgName ||
                                            accountData?.AccountName ||
                                            accountData?.Name ||
                                            "Organisation"}
                                    </p>
                                    <div className="flex gap-2"><span className="chip bg-yellow-500 text-Black my-0 py-0 ">{prevData.type || 'Category'}</span><span className="flex items-center justify-center">Location: {prevData.location}</span></div>
                                </div>
                            </div> 
                        </div>
                    <div className="content-grid">
                        <div className="left-column p-2">
                            <div className="panel">
                                <h2>About this Campaign</h2>
                                <p>{prevData.desc || 'Your campaign story will appear here...'}</p>
                                {galleryImages.length > 0 ? (
                                    <div className="mt-4">
                                        <h3 className="mb-2">Campaign Gallery</h3>
                                        <div className="relative rounded-xl overflow-hidden border border-black/20 bg-black/5">
                                            {currentGalleryImage && (
                                                <img
                                                    src={currentGalleryImage}
                                                    alt={`Campaign image ${galleryIndex + 1}`}
                                                    className="w-full h-[220px] object-cover"
                                                />
                                            )}
                                            {galleryImages.length > 1 && (
                                                <div className="flex items-center justify-between p-2 bg-white">
                                                    <button
                                                        type="button"
                                                        className="chip"
                                                        onClick={() =>
                                                            setGalleryIndex((prev) =>
                                                                prev === 0 ? galleryImages.length - 1 : prev - 1
                                                            )
                                                        }
                                                    >
                                                        Prev
                                                    </button>
                                                    <span className="text-xs font-semibold">
                                                        {galleryIndex + 1} / {galleryImages.length}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="chip"
                                                        onClick={() =>
                                                            setGalleryIndex((prev) =>
                                                                prev === galleryImages.length - 1 ? 0 : prev + 1
                                                            )
                                                        }
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : isLivePreview ? (
                                    <div className="mt-4">
                                        <h3 className="mb-2">Campaign Gallery</h3>
                                        <div className="rounded-xl border border-black/20 bg-black/5 p-4">
                                            <div className="h-[220px] w-full rounded-lg border border-dashed border-black/25 bg-white/70 flex items-center justify-center text-sm font-semibold text-black/60">
                                                Additional images will appear here in a carousel
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-white mt-2 rounded-lg">
                                                <button type="button" className="chip" disabled>
                                                    Prev
                                                </button>
                                                <span className="text-xs font-semibold text-black/60">0 / 0</span>
                                                <button type="button" className="chip" disabled>
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {packages.length > 0 ? (
                                <div className="panel">
                                    <h2>Sponsorship packages</h2>
                                    <p className="text-sm text-black/60 mt-0 mb-3">
                                        Available tiers — select one you are interested in.
                                    </p>
                                    {packages.map((pkg, index) => (
                                        <div key={`${pkg.title}-${index}`} className="package">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="campaign-package"
                                                    checked={selectedPackageIndex === index}
                                                    onChange={() => setSelectedPackageIndex(index)}
                                                />
                                                <span>
                                                    {(pkg.packageType || pkg.title).trim()} — £
                                                    {Number(pkg.price).toLocaleString("en-GB")}
                                                    {pkg.packageType &&
                                                    pkg.title &&
                                                    pkg.packageType.trim() !== pkg.title.trim()
                                                        ? ` (${pkg.title.trim()})`
                                                        : null}
                                                </span>
                                            </label>
                                            {pkg.benefitLines && pkg.benefitLines.length > 0 ? (
                                                <ul>
                                                    {pkg.benefitLines.map((line, i) => (
                                                        <li key={i}>{line}</li>
                                                    ))}
                                                </ul>
                                            ) : pkg.benefitIds && pkg.benefitIds.length > 0 ? (
                                                <p className="text-sm m-0 mt-2" style={{ color: "var(--muted)" }}>
                                                    {pkg.benefitIds.length} sponsor benefit(s) in this tier.
                                                </p>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : isLivePreview ? (
                                <div className="panel">
                                    <h2>Sponsorship packages</h2>
                                    <p className="text-sm text-black/60 m-0">
                                        Add packages in the campaign editor to list sponsor tiers here.
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <aside className="right-column">
                            <div className="my-4 ml-4">
                                <h2 className="font-Body text-2xl">Contact with us</h2>
                                {socialLinks.length > 0 ? (
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {socialLinks.map((item) => (
                                            <a
                                                key={item.key}
                                                href={item.url}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="text-2xl"
                                            >
                                                <FontAwesomeIcon icon={item.icon} />
                                            </a>
                                        ))}
                                    </div>
                                ) : isLivePreview ? (
                                    <div className="mt-2 rounded-xl border border-dashed border-black/25 bg-black/5 p-3">
                                        <p className="text-sm font-semibold text-black/60 m-0">
                                            Add social links in the form to show your channels here.
                                        </p>
                                        <div className="flex flex-wrap gap-4 mt-3 text-2xl text-black/35">
                                            <FontAwesomeIcon icon={faGlobe} />
                                            <FontAwesomeIcon icon={faInstagram} />
                                            <FontAwesomeIcon icon={faTwitter} />
                                            <FontAwesomeIcon icon={faFacebook} />
                                            <FontAwesomeIcon icon={faLinkedin} />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm font-semibold text-black/60 m-0 mt-2">
                                        No public links listed for this campaign yet.
                                    </p>
                                )}
                            </div>
                            <div className="panel progress-panel">
                                <h2>Campaign Progress</h2>
                                <h3>£{(prevData.raised ?? 0).toLocaleString()}</h3>
                                <p className="target">of £{prevData.goal.toLocaleString()} target</p>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                                </div>
                                <span className="funded">{progressPercentage}%</span>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    )
}