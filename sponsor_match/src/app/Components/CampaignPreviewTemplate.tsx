"use client";

import { useEffect, useState } from "react";
import "@/app/campaign/campaign.css";

interface CampaignPreviewProps{
    prevData: {
        name: string;
        orgName?: string;
        type?: string;
        desc?: string;
        goal: number;
        raised: number;
        location?: string;
        coverImageUrl?: string | null;
    };
    isLivePreview?: boolean;
}

export default function CampaignPreviewTemplate({prevData, isLivePreview}: CampaignPreviewProps){
    const progressPercentage = Math.min(100, Math.round((prevData.raised/(prevData.goal || 1)) * 100));

    const [accountData, setAccountData] = useState<any | null>(null);

    useEffect(() => {
        const fetchAccountData = async (): Promise<void> => {
            try {
                const response = await fetch('/api/getAccountData');
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

    const companyLogoSrc = accountData?.CompanyLogo
        ? accountData.CompanyLogo.startsWith("http") || accountData.CompanyLogo.startsWith("/")
            ? accountData.CompanyLogo
            : `/api/files/${String(accountData.CompanyLogo).replace(/^\/+/, "")}`
        : "/placeholder-logo.png";

    console.log(accountData?.AccountId);
    return (
        <div className='campaign-page'>
            {isLivePreview && (
                <div className="bg-yellow-100 p-2 text-center border-b-2 border-yellow-400 font-bold text-sm">Live Preview Mode</div>
            )}
            <section className="page-container">
                <div className="hero-card">
                    <div style={{backgroundImage: `url(${prevData.coverImageUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc'})`}} className="hero-image">
                        {!isLivePreview && <button className='back-button'>Back</button>}
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
                                <div className="hero-meta flex flex-col gap-0 justify- items-start">
                                    <span className="org my-0 py-0">by {accountData?.AccountName || accountData?.Name || "Organisation"}</span>
                                    <span className="chip bg-yellow-500 text-Black my-0 py-0 ">{prevData.type || 'Category'} | Location, {prevData.location || 'Uk'}</span>
                                </div>
                            </div> 
                        </div>

                    <div className="content-grid">
                        <div className="left-column">
                            <div className="panel">
                                <h2>About this Campaign</h2>
                                <p>{prevData.desc || 'Your campaign story will appear here...'}</p>
                            </div>
                        </div>

                        <aside className="right-column">
                            <div className="panel progress-panel">
                                <h2>Campaign Progress</h2>
                                <h3>£{prevData.raised.toLocaleString()}</h3>
                                <p className="target">of £{prevData.goal.toLocaleString()} target</p>
                                <div className="prgress-bar">
                                    <div className="progress-fill" style={{width: `${progressPercentage}`}}/>
                                    <span className="funded">{progressPercentage}%</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    )
}