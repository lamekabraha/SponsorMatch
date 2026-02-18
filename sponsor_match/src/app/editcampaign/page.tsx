"use client";

import { useState } from "react";
import {signIn} from "next-auth/react";
import { useRouter } from "next/navigation";
import "./editcampaign.css";
import Footer from "../Components/Footer";
import Link from "next/link";
import Navbar from "../Components/Navbar";
import ImageDropzone from "../Components/DragandDrop";

export default function EditCampaignPage() {
    return (
            <>
                        <Navbar />
                        <Footer />
                        <div className="ec-page">
                            <Link href="/campaign" className="back-btn">
                                     ← Back
                            </Link>
            
                        <div className="ec-header">
                            <h1 className="text-3xl font-Heading text-center mt-10">Edit your Campaign</h1>
                            <p className="ec-subtitle">Edit your campain to connect with sponsors!</p>
                        </div>
            
            
                        <div className="ec-card">
                        <form className="ec-form">
                            <label className="ec-label">Campaign Name<span className="ec-required">*</span></label>
                            <input className="ec-input" type="text" />
                            <label className="ec-label">Contact Email<span className="ec-required">*</span></label>
                            <input className="ec-input" type="email" />
                            <label className="ec-label">Contact Number<span className="ec-required">*</span></label>
                            <input className="ec-input" type="tel" />
                            <label className="ec-label">Funding Needed £<span className="ec-required">*</span></label>
                            <input className="ec-input" type="number" />
                            <label className="ec-label">About the Campaign<span className="ec-required">*</span></label>
                            <textarea className="ec-inputlarge"/>
                            <label className="ec-label">Image Drop<span className="ec-required">*</span></label>
                            <ImageDropzone />
            
            
            
                            <button className="ec-submit" type="submit">
                                Update
                            </button>
                        </form>
                    </div>
                    </div></>
                      );
                      
                      
}
                
        