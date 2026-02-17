import Link from "next/link";
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
    return (
        <>
            <h1 className="text-3xl font-Heading text-center mt-0 relative z-200">Sponsor Match</h1>
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "50px",
                backgroundColor: "#fed857",
                zIndex: 50
            }} />
            <div className="fixed top-0 left-0 z-[200] group"> 
                <Link href="/">
                    <img
                        src="/Logo1.png"
                        alt="Funding Logo"
                        width={150}
                        height={150}
                        className="relative z-100 "
                        
                    />
                </Link>
                <div 
                    className="absolute top-0 left-0 w-64 h-screen-[50px] bg-Yellow shadow-xl 
                    opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-all duration-300"
                    >
                     <div className="p-6 space-y-4">
                        <p className="font-Heading text-lg">Menu</p>
                        <Link href="/search" className="font-Heading hover:underline block mb-4">Search</Link>
                        <Link href="/...." className="font-Heading hover:underline block mb-4">My Account</Link>
                        <Link href="/...." className="font-Heading hover:underline block mb-4">Create Campain</Link>
                        <Link href="/...." className="font-Heading hover:underline block mb-4">Favourites</Link>
                        <Link href="/" className="font-Heading hover:underline block mb-4">Logout</Link>
                     </div>   
                </div>
                
            </div>
            <div 
                className="fixed top-3 right-0 z-200 group"
            >
                <FontAwesomeIcon icon={faCircleUser} className="text-2xl bg-Yellow px-4 py-1 text-Black rounded "/>
                <div 
                    className="absolute top-9 right-0 w-64 h-screen-[50px] bg-Yellow shadow-xl 
                    opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-all duration-300"
                    >
                     <div className="p-6 space-y-4">                        
                        <Link href="/...." className="font-Heading hover:underline block mb-4">My Account</Link>
                        <Link href="/" className="font-Heading hover:underline block mb-4">Logout</Link>
                     </div>   
                </div>
            </div>
        </>
    );
}
