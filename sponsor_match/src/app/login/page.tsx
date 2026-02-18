"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
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
        <div className="log-page">
          <div className="log-header">
        <div className="reg-header pt-[50px]">
        
        <Header />
        <Footer />
        <div className="fixed top-0 left-0 w-full h-[50px] bg-Yellow z-[100] flex items-center space-x-4 justify-end pr-4 ">
          <Link href="/register"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-100">Sign Up</button></Link>         
          <Link href="/"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-100">Home</button></Link>
        </div>
        <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 200
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
        <h1 className="log-title">SponsorMatch</h1>
    </div>
    </div>
      <div className="log-card">
    <form className="log-form" onSubmit={handleSubmit}>
          <label className="log-label">
            Email address <span className="log-required">*</span>
          </label>
          <input
            className="log-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="log-label">
            Password <span className="log-required">*</span>
          </label>
          <div className="log-password-wrapper">
            <input
              className="log-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="log-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="log-error">{error}</p>}

          <button className="log-submit" type="submit">
            Log in
          </button>

        <p className="log-bottom-text">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
}
