import {library} from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import Footer from './Components/Footer';
import Header from './Components/Header';
library.add(faCheck);
library.add(faTwitter);

export default function Home() {
  return (
    <div>
      <h1 className="text-center text-3xl font-Heading relative z-100">Sponsor Match</h1>
      <Header />
      <Footer />
      <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 100
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
        <div className="fixed top-0 left-0 w-full h-[50px] bg-[#fed857] z-[99] flex items-center space-x-4 justify-end pr-4 ">
          <button className="px-4 py-2 font-Body bg-[#fed857] hover:bg-[#ffffff] rounded relative z-100">Login</button>
          <button className="px-4 py-2 font-Body bg-[#fed857] hover:bg-[#ffffff] rounded relative z-100">Sign Up</button>
        </div>
    </div>
  );
}
