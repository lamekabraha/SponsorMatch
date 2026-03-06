import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser as faUsersRegular } from '@fortawesome/free-regular-svg-icons';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';


import Link from 'next/link';
import Footer from './Components/Footer';
import Header from './Components/Header';
library.add(faUsersRegular);
library.add(faHeartRegular);
library.add(faBuilding);
library.add(faChartBar);
library.add(faArrowRight);
export default function HomePage(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Login & Sign Up btns */}
      <div className="fixed top-0 right-0 h-[50px] bg-Yellow z-[200] flex items-center space-x-4 justify-end pr-4 ">
        <Link href="/login"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded sicky z-200">Login</button></Link>         
        <Link href="/register"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded sticky z-200">Sign Up</button></Link>
      </div>


      <main className="mx-2 sm:mx-0">
        <div className='h-screen w-full place-content-center sm:flex sm:mb-15'>
          {/* Text & Button */}
          <div className="mb-5 text-center flex-1 flex flex-col items-center justify-center w-full w-1/3 sm:px-20 sm:text-left sm:items-start">
            <p className="text-2xl font-Body mb-4 px-5 sm:px-0">A platform where grassroots sports clubs, community groups, and voluntary
            organisations connect with companies seeking meaningful partnerships.
            Build relationships that strengthen communities.</p>
            <Link href="/register"><button className="flex items-center justify-center px-6 py-3 bg-Yellow hover:bg-[#f0c23c] rounded-lg font-Body sm:justify-start">
              Get Started
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button></Link>
          </div>

          {/* Side Image */}
          <div className="sm:flex-2 my-auto">

            <img
              src="/LandingPageImage2.png"
              alt="Side Image"
              className="w-full object-cover rounded-3xl sm:rounded-l-3xl sm:rounded-r-none"
            />
          </div>
        </div>
        
        {/* Platform Features Section */}
        <div className="sm:mx-20">
          <p className='text-center text-md font-Body mb-2'>Features</p>
          
          <h1 className='text-center text-3xl font-Body font-bold text-Black mb-5 sm:text-left'>How it works:</h1>
          
          <p className="text-Body text-md text-center mx-5 text-gray-500 mb-10">A simple process to connect community organisations with corporate partners.</p>

          <div className='sm:grid sm:grid-cols-2 sm:gap-4 px-10'>
            <div className="flex flex-col items-center mb-10 sm:flex-row gap-2">
              <FontAwesomeIcon icon={faUsersRegular} className="border-none bg-Yellow rounded-lg p-2 text-3xl sm:text-5xl" />
              <div className="text-center sm:text-left sm:mx-5">
                <p className="text-2xl font-Body">For Community Organisations</p>
                <p className="font-Body text-gray-500">Sports clubs, community groups and voluntary organisations 
                  can create campaigns, showcase their impact and 
                  connect with corprate partners.</p>
              </div>
            </div>

            <div className="flex flex-col items-center mb-10 sm:flex-row gap-2">
              <FontAwesomeIcon icon={faHeartRegular} className="border-none bg-Yellow rounded-lg p-2 text-3xl sm:text-5xl"/>
              <div className="text-center sm:text-left sm:mx-5">
                <p className="text-2xl font-Body">Meaningful Partnerships</p>
                <p className="font-Body text-gray-500">Build relationships that go beyond financial support, creating lasting impact in your local community.</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center mb-10 sm:flex-row gap-2">
              <FontAwesomeIcon icon={faBuilding} className="border-none bg-Yellow rounded-lg p-2 text-3xl sm:text-5xl"/>
              <div className="text-center sm:text-left sm:mx-5">
                <p className="text-2xl font-Body">For Corporate Partners</p> 
                <p className="font-Body text-gray-500">Discover local causes aligned with your CSR goals, choose partnership
                  packages and track your community impact.</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center mb-10 sm:flex-row gap-2">
              <FontAwesomeIcon icon={faChartBar} className="border-none bg-Yellow rounded-lg p-2 text-3xl sm:text-5xl"/>
              <div className="text-center sm:text-left sm:mx-5">
                <p className="text-2xl font-Body">Measure Impact</p>
                <p className="font-Body text-gray-500">Track and Report on the difference your partnership
                  makes with deatailed impact reports for CSR reporting.</p>
              </div>
            </div>
          </div>

          {/* Get Started Section */}
          <div className='py-30 px-5 sm:flex sm:justify-between'>
            <div className='font-Body text-3xl pb-5'>
              <h1>Ready to get started?</h1>
              <h1>Join our platform today.</h1>
            </div>
            <Link href="/register"><button className="flex items-center justify-center px-6 py-3 bg-Yellow hover:bg-[#f0c23c] rounded-lg font-Body sm:justify-start">
              Get Started
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button></Link>
          </div>
        </div>
      </main>
    <Footer />
    </div>
  );
}
