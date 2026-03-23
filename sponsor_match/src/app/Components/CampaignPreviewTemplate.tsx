import '@/app/campaign/campaign.css';

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

    return (
        <div className='campaign-page'>
            {isLivePreview && (
                <div className="bg-yellow-100 p-2 text-center border-b-2 border-yellow-400 font-bold text-sm">Live Preview Mode</div>
            )}
            <section className="page-container">
                <div className="hero-card">
                    <div style={{backgroundImage: `url(${prevData.coverImageUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc'})`}} className="hero-image">
                        {!isLivePreview && <button className='back-button'>Back</button>}
                        <div className="hero-content">
                            <h1 className="text-white">{prevData.name || 'Campaign Title'}</h1>
                            <p className="org">by {prevData.orgName || 'Organisation'}</p>
                            <div className="hero-meta">
                                <span className="chip">{prevData.type || 'Category'}</span>
                                <span>Location, {prevData.location || 'Uk'}</span>
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