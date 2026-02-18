import Link from "next/link";

export default function Header() {
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
            <h1 className="text-3xl font-Heading text-center mt-0 relative z-200">Sponsor Match</h1>
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
                        className="relative z-100"
                    />
                </Link>
            </div>
            
        <div></div>
        </>
    );
}
           