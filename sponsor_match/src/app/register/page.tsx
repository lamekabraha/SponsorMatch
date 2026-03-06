"use client";

import { useState } from "react";
import {signIn} from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateEmail(email)){
      setError("Please Enter a valid email address.");
      return;
    }  

    if (!validatePassword(password)){
      setError("Password must be a minimum of 8 characters and include a symbol and a number.");
      return;
    }

    if (password !== confirmPassword){
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try{
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          accountName: accountName.trim(),
          email: email.toLocaleLowerCase(),
          password,
          accountType,
        }),
      });

      const data = await res.json();

      if(!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }

      const signInResult = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.ok && accountType === "vcse") {
        router.push('/register/onboarding');
        router.refresh();
      } else if (signInResult?.ok && accountType === "business") {
        router.push('/register/onboarding');
        router.refresh();
      } else {
        setError("Invalid credentials. Please try again.");
      }

      
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }


  
  return (
    <>
    <div className="z-[100] fixed w-full">
      <Header/>
      <div className="fixed top-0 right-0 h-[50px] bg-Yellow z-[200] flex items-center space-x-4 justify-end pr-4 ">
        <Link href="/login"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-200">Login</button></Link>         
        <Link href="/"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-200">Home</button></Link>
      </div>
    </div>
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-10 px-4 font-sans sm:fixed sm:left-0 sm:right-0 sm:top-0 sm:bottom-0 sm:z-[1]">
      <div className="text-center mb-5">
        <h1 className="text-3xl font-Heading text-center mt-10">Create your account</h1>
        <p className="mt-2 text-xs text-neutral-800/65">Join our platform and start connecting</p>
      </div>

      <div className="w-[420px] max-w-[92vw] bg-white border border-black/10 border-t-4 border-t-[#fed857] rounded-[10px] p-[22px] shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
        <p className="m-0 mb-3 text-[13px] text-neutral-800/75">I am a:</p>

        <div className="grid grid-cols-2 gap-3.5 mb-5">
          <button
            type="button"
            className={`border rounded-[10px] bg-white p-4 cursor-pointer text-center flex flex-col justify-center min-h-[120px] transition duration-200 ease-in-out ${
              accountType === "business"
                ? "bg-neutral-900/80 border-neutral-900/80 text-white hover:translate-y-0 hover:shadow-none"
                : "border-black/35 hover:-translate-y-0.5 hover:border-[#fed857] hover:shadow-[0_10px_22px_rgba(0,0,0,0.06)]"
            }`}
            onClick={() => setAccountType("business")}
          >
            <div className="text-[13px] font-bold mb-2 leading-tight">Corporate Partner</div>
            <div className="text-[11px] leading-snug opacity-85">Company seeking partnerships</div>
          </button>

          <button
            type="button"
            className={`border rounded-[10px] bg-white p-4 cursor-pointer text-center flex flex-col justify-center min-h-[120px] transition duration-200 ease-in-out ${
              accountType === "vcse"
                ? "bg-neutral-900/80 border-neutral-900/80 text-white hover:translate-y-0 hover:shadow-none"
                : "border-black/35 hover:-translate-y-0.5 hover:border-[#fed857] hover:shadow-[0_10px_22px_rgba(0,0,0,0.06)]"
            }`}
            onClick={() => setAccountType("vcse")}
          >
            <div className="text-[13px] font-bold mb-2 leading-tight">Community Organisation</div>
            <div className="text-[11px] leading-snug opacity-85">Sports club, charity, or group</div>
          </button>
        </div>

        <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
          <label className="text-xs font-bold mt-1.5">First Name <span className="text-[#fed857] font-black">*</span></label>
          <input
            className="h-[38px] px-3 rounded-lg border border-black/45 outline-none transition duration-200 focus:border-[#fed857] focus:ring-[3px] focus:ring-[#fed857]/35"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label className="text-xs font-bold mt-1.5">Last Name <span className="text-[#fed857] font-black">*</span></label>
          <input
            className="h-[38px] px-3 rounded-lg border border-black/45 outline-none transition duration-200 focus:border-[#fed857] focus:ring-[3px] focus:ring-[#fed857]/35"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <label className="text-xs font-bold mt-1.5">
            Email address <span className="text-[#fed857] font-black">*</span>
          </label>
          <input
            className="h-[38px] px-3 rounded-lg border border-black/45 outline-none transition duration-200 focus:border-[#fed857] focus:ring-[3px] focus:ring-[#fed857]/35"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-xs font-bold mt-1.5">
            {accountType === "business" ? "Business Name" : "Organisation Name"}{" "}
            <span className="text-[#fed857] font-black">*</span>
          </label>
          <input
            className="h-[38px] px-3 rounded-lg border border-black/45 outline-none transition duration-200 focus:border-[#fed857] focus:ring-[3px] focus:ring-[#fed857]/35"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />

          <label className="text-xs font-bold mt-1.5">
            Password <span className="text-[#fed857] font-black">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              className="h-[38px] w-full pr-12 px-3 rounded-lg border border-black/45 outline-none transition duration-200 focus:border-[#fed857] focus:ring-[3px] focus:ring-[#fed857]/35"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2.5 bg-transparent border-none text-xs cursor-pointer text-neutral-800/70 font-semibold hover:text-[#fed857]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label className="text-xs font-bold mt-1.5">
            Confirm password <span className="text-[#fed857] font-black">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              className="h-[38px] w-full pr-12 px-3 rounded-lg border border-black/45 outline-none transition duration-200 focus:border-[#fed857] focus:ring-[3px] focus:ring-[#fed857]/35"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2.5 bg-transparent border-none text-xs cursor-pointer text-neutral-800/70 font-semibold hover:text-[#fed857]"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <button
            className="mt-3.5 h-[42px] rounded-lg border-0 bg-[#fed857] text-black cursor-pointer font-bold text-sm transition duration-200 hover:bg-neutral-900/90 hover:text-white"
            type="submit"
          >
            Sign up
          </button>
        </form>
      </div>
    </div></>
  );
}
