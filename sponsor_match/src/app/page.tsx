import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { faHeart} from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { faSquarePollVertical } from '@fortawesome/free-solid-svg-icons';

import Link from 'next/link';
import Footer from './Components/Footer';
import Header from './Components/Header';
library.add(faCheck);
library.add(faTwitter);
library.add(faPeopleGroup);
library.add(faHeart);
library.add(faBuilding);
library.add(faSquarePollVertical);

export default function HomePage(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="fixed top-0 right-0 h-[50px] bg-Yellow z-[200] flex items-center space-x-4 justify-end pr-4 ">
          <Link href="/login"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-200">Login</button></Link>         
          <Link href="/register"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-200">Sign Up</button></Link>
        </div>
      <main className="flex-grow pt-[50px] pb-32">
        <div>
          <img
            src="/LandingPageImage2.png"
            alt="Side Image"
            className="hide-mobile fixed right-0 top-[50px] h-[calc(100%-50px)] object-cover z-[50]"/>
        </div>
      <div className="flex pr-10 mt-20">
        <div className="w-full max-w-md mx-auto ml-20 text-center">
          <p className="text-lg font-Body mb-4">
            A platform where grassroots sports clubs, community groups, and voluntary
            organisations connect with companies seeking meaningful partnerships.
            Build relationships that strengthen communities.
          </p>
            
    <div className="flex flex-col items-center mt-6">
    <Link href="/register"><button className="flex items-center justify-center px-6 py-3 bg-[#fed857] hover:bg-[#f0c23c] rounded-full font-Body">
      Get Started →
    </button></Link>
    <div className="flex flex-col items-center mt-6">
          <FontAwesomeIcon icon={faPeopleGroup} className=" flex items-center justify-center px-4 py-2 bg-Yellow text-6xl text-Black mt-10 rounded mb-4" />
          <p className="text-center text-2xl font-Body mb-2">For Community Organisations</p>
          <p className="text-center font-Body mb-4">Sports clubs, community groups and voluntary organisations 
            can create campaigns, showcase their impact and 
            connect with corprate partners.</p>
    <div className="flex flex-col items-center mt-6">
          <FontAwesomeIcon icon={faHeart} className=" flex items-center justify-center px-4 py-2 bg-Yellow text-6xl text-Black mt-10 rounded mb-4"/>
          <p className="text-center text-2xl font-Body mb-2">Meaningful Partnerships</p>
          <p className="text-center font-Body mb-4">Build relationships that go beyond financial support, creating lasting 
            impact in your local community.</p>
    <div className="flex flex-col items-center mt-6">
          <FontAwesomeIcon icon={faBuilding} className=" flex items-center justify-center px-4 py-2 bg-Yellow text-6xl text-Black mt-10 rounded mb-4"/>
          <p className="text-center text-2xl font-Body mb-2">For Corporate Partners</p> 
          <p className="text-center font-Body mb-4">Discover local causes aligned with your CSR goals, choose partnership
            packages and track your community impact.</p>
    <div className="flex flex-col items-center mt-6">
          <FontAwesomeIcon icon={faSquarePollVertical} className=" flex items-center justify-center px-4 py-2 bg-Yellow text-6xl text-Black mt-10 rounded mb-4"/>
          <p className="text-center text-2xl font-Body mb-2">Measure Impact</p>
          <p className="text-center font-Body mb-4">Track and Report on the difference your partnership
            makes with deatailed impact reports for CSR reporting.</p>
    </div>
    </div>
  </div>
</div>
</div>
</div>
</div>
</main>
<Footer />
    </div>

    
  );
}

