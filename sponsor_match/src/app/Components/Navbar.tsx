"use client";

import { useState } from "react";
import Link from "next/link";
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";

export default function Navbar() {

    return (
        <div className='bg-Yellow w-full flex sticky top-0 left-0 z-100'>
            <div className="group">
                <img
                    src="/Logo1.png"
                    alt="Funding Logo"
                    width={175}
                    height={175}
                    className="justify-start "
                />
                <div 
                    className = "absolute top-0 left-0 w-64 h-screen-[50px] bg-Yellow shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300"
                    >
                    <div onClick={(e) => e.stopPropagation()} className="p-6 space-y-4">
                        <p className="font-Heading text-2xl">Menu</p>
                        <Link href="/dashboard" className="font-Heading hover:underline block mb-4"> Dashboard</Link>
                        <Link href="/myaccount" className="font-Heading hover:underline block mb-4">My Account</Link>
                        <Link href="/search" className="font-Heading hover:underline block mb-4">Search</Link>
                        <Link href="/newcampaign" className="font-Heading hover:underline block mb-4">Create Campaign</Link>
                        <Link href="/campaign" className="font-Heading hover:underline block mb-4">My Campaign</Link>
                        <Link href="/favourites" className="font-Heading hover:underline block mb-4">Favourites</Link>
                        <Link href="/" className="font-Heading hover:underline block mb-4">Logout</Link>
                    </div>   
                </div>
            </div>
            <div className="hidden sm:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full flex justify-center items-center pointer-events-none">
                <h1 className="text-3xl font-Heading text-center select-none">SponsorMatch</h1>
            </div>
            <div>
                <div className="fixed top-2 right-0 z-[300] group">
                    <FontAwesomeIcon icon={faCircleUser} className="text-2xl bg-Yellow px-4 py-1 text-Black rounded "/>
                    <div onClick={(e) => e.stopPropagation()} className="absolute top-7 right-0 w-64 h-screen-[50px] bg-Yellow shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300">
                        <div className="p-6 space-y-4">                        
                            <Link href="/myaccount" className="font-Heading hover:underline block mb-4">My Account</Link>
                            <Link href="/" className="font-Heading hover:underline block mb-4">Logout</Link>
                        </div>   
                    </div>
                </div>
            </div>
        </div>
    );
}

{/* <h1 className="hide-mobile fixed text-3xl font-Heading text-center top-0 relative z-200">Sponsor Match</h1>
<div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "50px",
    backgroundColor: "#fed857",
    zIndex: 50
    }} />

    <div className="fixed top-0 left-0 z-200 group"> 
        <Link href="">
            <img
                src="/Logo1.png"
                alt="Funding Logo"
                width={150}
                height={150}
                className="relative z-100 "
                
            />
        </Link>
        
        <div 
            className = "absolute top-0 left-0 w-64 h-screen-[50px] bg-Yellow shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300"
            
            >
            <div className="p-6 space-y-4">
                <p className="font-Heading text-lg">Menu</p>
                <Link href="/dashboard" className="font-Heading hover:underline block mb-4"> Dashboard</Link>
                <Link href="/myaccount" className="font-Heading hover:underline block mb-4">My Account</Link>
                <Link href="/search" className="font-Heading hover:underline block mb-4">Search</Link>
                <Link href="/newcampaign" className="font-Heading hover:underline block mb-4">Create Campaign</Link>
                <Link href="/campaign" className="font-Heading hover:underline block mb-4">My Campaign</Link>
                <Link href="/favourites" className="font-Heading hover:underline block mb-4">Favourites</Link>
                <Link href="/" className="font-Heading hover:underline block mb-4">Logout</Link>
            </div>   
        </div>
        
    </div>
    <div 
        className="fixed top-2 right-0 z-[300] group"
    >
        <FontAwesomeIcon icon={faCircleUser} className="text-2xl bg-Yellow px-4 py-1 text-Black rounded "/>
        <div onClick={(e) => e.stopPropagation()} 
            className="absolute top-7 right-0 w-64 h-screen-[50px] bg-Yellow shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300"
            >
            <div className="p-6 space-y-4">                        
            <Link href="/myaccount" className="font-Heading hover:underline block mb-4">My Account</Link>
            <Link href="/" className="font-Heading hover:underline block mb-4">Logout</Link>
        </div>   
    </div>
</div> */}