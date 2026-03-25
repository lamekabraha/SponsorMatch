import Navbar from '@/app/Components/Navbar';
import Link from 'next/link';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DashboardDataCard } from '@/app/Components/DashboardDataCard';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { DashboardCampaignCard } from '@/app/Components/DashboardCampaignCard';
import Footer from '@/app/Components/Footer';

export default function CorporateDashboard() {
    return (
        <>
            <Navbar />
            <main className="flex gap-4 flex-col max-w-[1200px] mx-auto mt-[18px] mb-[60px] px-[16px]">
                <section className="mt-4 flex items-center justify-between gap-3">
                    <h1 className="m-0 text-[28px] font-extrabold tracking-tight text-[#0b0f19]">
                        Welcome Back
                    </h1>
                    <div className="flex flex-row gap-2">
                        <Link href="#">
                            <button className="border border-black/10 bg-white rounded-xl px-4 py-3 cursor-pointer font-extrabold text-[#0b0f19] flex items-center gap-2 transition-transform transition-bg duration-100 active:translate-y-px">
                                <FontAwesomeIcon icon={faStar} className="mr-2" size="lg" />
                                Favourite
                            </button>
                        </Link>
                        <Link href="#">
                            <button type="button" className="border border-black/10 bg-Yellow rounded-xl px-4 py-3 cursor-pointer font-extrabold text-[#0b0f19] flex items-center gap-2 transition-transform transition-bg duration-100 active:translate-y-px">
                                <FontAwesomeIcon icon={faSearch} className="mr-2" size="lg" />
                                Find New Campaigns
                            </button>
                        </Link>
                    </div>
                </section>
                {/* Quick Corporate Data*/}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DashboardDataCard title="Total Invested" data="£12,400" />
                    <DashboardDataCard title="Active Partnerships" data="5" />
                    <DashboardDataCard title="Connections" data="8" />
                    <DashboardDataCard title="Impact Score" data="92" />
                </section>

                {/* Filters */}
                <section className="flex justify-end gap-4">
                    <input type="text" placeholder="Search" className="border border-black/10 bg-white rounded-xl px-4 py-3 cursor-pointer font-extrabold text-[#0b0f19] flex items-center gap-2 transition-transform transition-bg duration-100 active:translate-y-px" />
                    <select name="filter" id="filter" className="border border-black/10 bg-white rounded-xl px-4 py-3 cursor-pointer font-bold text-[#0b0f19] flex items-center gap-2 transition-transform transition-bg duration-100 active:translate-y-px">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </section>
                {/* Partnerred Campaigns */}
                <section className="grid grid-cols-3 gap-2">
                    
                    <DashboardCampaignCard
                  title="Campaign 1"
                  category="Environment"
                  raised={1000}
                  goal={10000}
                  status="open"
                  coverImageUrl="/204Cover.jpg"
                />
                <DashboardCampaignCard
                  title="Campaign 2"
                  category="Education"
                  raised={2000}
                  goal={20000}
                  status="open"
                  coverImageUrl="/204Cover.jpg"
                />
                <DashboardCampaignCard
                  title="Campaign 3"
                  category="Sports"
                  raised={3000}
                  goal={30000}
                  status="open"
                  coverImageUrl="/204Cover.jpg"
                />
                </section>
            </main>
            <Footer/>
        </>
    );
}