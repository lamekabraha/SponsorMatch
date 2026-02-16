import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import Footer from './Components/Footer';
import Header from './Components/Header';
library.add(faCheck);
library.add(faTwitter);

  return (
    <div>
      
      <h1 className="text-center text-3xl font-Heading relative z-100 hidden md:flex md:justify-center">Sponsor Match</h1>
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
        <div>
          <img
            src="/LandingPageImage1.png"
            alt="Side Image"
            className="fixed right-0 top-[50px] h-[calc(100%-50px)] object-cover z-[50]"/>
        </div>
      <div className="flex pr-10 mt-40">
  <div className="max-w-xs text-right">
    <p className="text-lg font-Body mb-4">
      A platform where grassroots sports clubs, community groups, and voluntary
      organisations connect with companies seeking meaningful partnerships.
      Build relationships that strengthen communities.
    </p>

    <button className="px-6 py-3 bg-[#fed857] hover:bg-[#f0c23c] rounded-full font-Body">
      Get Started →
    </button>
    <img src="/Icon1.png" alt="Icon1" className="w-16 h-16" />

          <p className="text-center font-Body mb-4">Sports clubs, community groups and voluntary organisations 
            can create campaigns, showcase their impact and 
            connect with corprate partners..</p>
  </div>
</div>
    </div>
    
  );
}