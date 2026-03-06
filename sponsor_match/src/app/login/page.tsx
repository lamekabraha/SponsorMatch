"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if(!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.trim().length === 0){
      setError('Please enter your password');
      return;
    }

    signIn('credentials', {
      email: email.toLowerCase(),
      password,
      redirect: false,
    }).then((result) => {
      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      if (result?.ok) {
        router.push("/register/onboarding/vcse/basic_info");
        router.refresh();
      }
    });
  }

  return (
    <>
    <Header />
    <div className="fixed top-0 right-0 h-[50px] bg-Yellow z-[200] flex items-center space-x-4 justify-end pr-4 ">
      <Link href="/register"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-200">Sign Up</button></Link>         
      <Link href="/"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-200">Home</button></Link>
    </div>


    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-10 px-4 font-sans fixed left-0 right-0">
      <div className="text-center mb-6">
        <h1 className="m-0 text-[28px] font-bold">Log In</h1>
      </div>
      <div className="w-[420px] max-w-[92vw] bg-white border border-black/10 border-t-4 border-t-[#fed857] rounded-[10px] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="text-xs font-bold mt-1.5">
            Email address <span className="text-[#fed857] font-black">*</span>
          </label>
          <input
            className="h-10 w-full px-3 rounded-lg border border-black/45 outline-none transition duration-200 focus:border-[#fed857] focus:ring-[3px] focus:ring-[#fed857]/35"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-xs font-bold mt-1.5">
            Password <span className="text-[#fed857] font-black">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              className="h-10 w-full pr-14 px-3 rounded-lg border border-black/45 outline-none transition duration-200 focus:border-[#fed857] focus:ring-[3px] focus:ring-[#fed857]/35"
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

          {error && <p className="mt-1.5 text-[12px] font-semibold text-[#b00020]">{error}</p>}

          <button
            className="mt-4 h-11 rounded-lg border-0 bg-[#fed857] text-black cursor-pointer font-bold text-sm transition duration-200 hover:bg-neutral-900/90 hover:text-white"
            type="submit"
          >
            Log in
          </button>

          <p className="mt-3.5 text-center text-xs text-neutral-800/70">
            Don't have an account? <Link href="/register" className="text-black font-bold underline underline-offset-2 hover:text-[#fed857]">Register</Link>
          </p>
        </form>
      </div>
    </div>
    </>
  );
}
