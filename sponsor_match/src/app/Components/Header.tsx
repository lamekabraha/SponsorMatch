import Link from "next/link";
import "./Header.css";

export default function Header() {
    return (
        <div className='bg-Yellow w-full flex sticky top-0 left-0'>
            <Link href="/">
                <img
                    src="/Logo1.png"
                    alt="Funding Logo"
                    width={175}
                    height='auto'
                    className="justify-start"
                />
            </Link>
            <h1 className="hidden md:block text-3xl font-Heading text-center select-none w-full h-full top-[25%] absolute">SponsorMatch</h1>
        </div>
    );
}
           