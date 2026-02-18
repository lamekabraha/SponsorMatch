"use client";

import { useState } from "react";
import "./register.css";
import {signIn} from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Link from "next/link";

type Role = "business" | "vcse";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<Role>("business");
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

      if (signInResult?.ok) {
        router.push('/dashboard');
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
    <><Header />
    <div className="fixed top-0 right-0 h-[50px] bg-Yellow z-[200] flex items-center space-x-4 justify-end pr-4 ">
          <Link href="/login"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-200">Login</button></Link>         
          <Link href="/"><button className="px-4 py-2 font-Body bg-Yellow hover:bg-White rounded relative z-200">Home</button></Link>
        </div>
    <div className="reg-page">
      <Footer />
      <div className="reg-header">
        <h1 className="text-3xl font-Heading text-center mt-10">Create your account</h1>
        <p className="reg-subtitle">Join our platform and start connecting</p>
      </div>

      <div className="reg-card">
        <p className="reg-small-label">I am a:</p>

        <div className="reg-role-grid">
          <button
            type="button"
            className={`reg-role-tile ${accountType === "business" ? "is-active" : ""}`}
            onClick={() => setAccountType("business")}
          >
            <div className="reg-role-title">Corporate Partner</div>
            <div className="reg-role-desc">Company seeking partnerships</div>
          </button>

          <button
            type="button"
            className={`reg-role-tile ${accountType === "vcse" ? "is-active" : ""}`}
            onClick={() => setAccountType("vcse")}
          >
            <div className="reg-role-title">Community Organisation</div>
            <div className="reg-role-desc">Sports club, charity, or group</div>
          </button>
        </div>

        <form className="reg-form" onSubmit={handleSubmit}>
          <label className="reg-label">First Name <span className="reg-required">*</span></label>
          <input className="reg-input" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <label className="reg-label">Last Name <span className="reg-required">*</span></label>
          <input className="reg-input" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <label className="reg-label">
            Email address <span className="reg-required">*</span>
          </label>
          <input
            className="reg-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} />

          <label className="reg-label">
            {accountType === "business" ? "Business Name" : "Organisation Name"}{" "}
            <span className="reg-required">*</span>
          </label>
          <input className="reg-input" type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} />

          <label className="reg-label">
            Password <span className="reg-required">*</span>
          </label>
          <div className="reg-password-wrapper">
            <input
              className="reg-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)} />
            <button
              type="button"
              className="reg-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label className="reg-label">
            Confirm password <span className="reg-required">*</span>
          </label>
          <div className="reg-password-wrapper">
            <input
              className="reg-input"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} />
            <button
              type="button"
              className="reg-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

          <button className="reg-submit" type="submit">
            Sign up
          </button>
        </form>
      </div>
    </div></>
  );
}
