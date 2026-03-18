import Link from "next/link";
import "./Header.css";

export default function Header() {
    return (
        <div className='bg-Yellow w-full flex sticky top-0 left-0'>
            <Link href="/" className="w-5/12">
                <img
                    src="/Logo1.png"
                    alt="Funding Logo"
                    width={175}
                    height='auto'
                    className="justify-start"
                />
            </Link>
            <h1 className="hidden sm:flex sm:w-7/12 text-3xl my-auto">SponsorMatch</h1>
        </div>
    );
}
           