import Link from "next/link";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Slider from "../Components/Slider";

export default function SearchPage() {
    return (
        <div className="search-page">
            <Navbar />
            <Footer />
            <div className="w-64 bg-Yellow shadow-lg rounded-lg p-5 mt-10 ml-5">
                <button className="px-2 py-1 bg-Black text-White rounded mb-4 hover:bg-White hover:text-Black">Search</button>
                <h1 className="font-Body text-xl mb-4">Filters</h1>
            <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 accent-White" />
                    <span className="font-Body">Sports Club</span>
                </label>


                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 accent-White" />
                    <span className="font-Body">Charity</span>
                </label>

        
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 accent-White" />
                    <span className="font-Body">Community Organisation</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 accent-White" />
                    <span className="font-Body">Youth Club</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="font-Body">MaxBudget:</span>
                    <Slider />
                </label>
                <div className="relative group">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <button type="button" className="px-2 py-1 bg-Yellow text-Black border border-Black rounded">Distance</button>
                    <div 
                    className="absolute top-full left-0 w-64 h-screen-[50px] bg-Yellow shadow-xl 
                    opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-all duration-300 rounded"
                    >
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 accent-White" />
                            <span className="font-Body">within 10 Miles</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 accent-White" />
                            <span className="font-Body">within  20` Miles</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 accent-White" />
                            <span className="font-Body">within 50 Miles</span>
                        </label>
                    </div>
                </label>
                </div>
            </div>
        </div>
        </div>
    );
}

