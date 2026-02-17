import Link from "next/link";

export default function Navbar() {
    return (
        <>
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "50px",
                backgroundColor: "#fed857",
                zIndex: 50
            }} />
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 200
            }}>
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
                    className="absolute top-0 left-[150px] w-64 h-screen bg-Yellow shadow-xl 
                    opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-all duration-300"
                    >
                     <div className="p-6 space-y-4">
                        <p className="font-Body text-lg">Menu</p>
                        <Link href="/...." className="font-Body hover:underline">Search</Link>
                        <Link href="/...." className="font-Body hover:underline">My Account</Link>
                        <Link href="/...." className="font-Body hover:underline">Create Campain</Link>
                     </div>   
                </div>
            </div>
        </>
    );
}
