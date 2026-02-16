"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
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
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.trim().length === 0) {
      setError("Please enter your password.");
      return;
    }

// routing
const lower = email.toLowerCase();
const isVcse = lower.includes("vcse") || lower.includes("charity");

    if (isVcse) {
      router.push("/vcse/dashboard"); // not made yet
    } else {
      router.push("/business/dashboard"); // not made yet
    }
  };

  return (
    <div className="log-page">
      <div className="log-header">
        <h1 className="log-title">SponsorMatch</h1>
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
