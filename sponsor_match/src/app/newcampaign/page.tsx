"use client";

import { useState } from "react";
import {signIn} from "next-auth/react";
import { useRouter } from "next/navigation";
import "./newcampaign.css";
import Footer from "../Components/Footer";
import Link from "next/link";
import Navbar from "../Components/Navbar";
import ImageDropzone from "../Components/DragandDrop";

export default function NewCampaignPage() {
    return (
            <>
            <Navbar />
            <Footer />
            <div className="nc-page">

            <div className="nc-header">
                <h1 className="text-3xl font-Heading text-center mt-10">Create your Campaign</h1>
                <p className="nc-subtitle">Create your campain and connect with sponsors!</p>
            </div>


            <div className="nc-card">
            <form className="nc-form">
                <label className="nc-label">Campaign Name<span className="nc-required">*</span></label>
                <input className="nc-input" type="text" />
                <label className="nc-label">About the Campaign<span className="nc-required">*</span></label>
                <input className="nc-input" type="text" />
                <label className="nc-label">Contact Email<span className="nc-required">*</span></label>
                <input className="nc-input" type="email" />
                <label className="nc-label">Contact Number<span className="nc-required">*</span></label>
                <input className="nc-input" type="tel" />
                <label className="nc-label">Funding Needed £<span className="nc-required">*</span></label>
                <input className="nc-input" type="number" />
                <label className="nc-label">Image Drop<span className="nc-required">*</span></label>
                <ImageDropzone />



                <button className="nc-submit" type="submit">
                    Sign up
                </button>
            </form>
        </div>
        </div></>
          );
}