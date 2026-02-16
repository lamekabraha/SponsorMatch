"use client";

import { useState } from "react";
import "./register.css";

type Role = "business" | "vcse";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("business");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // used regex to validate email so that it is more secure
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // password validate
  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password has to be a minimum of 8 characters and include a symbol and number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

  alert("Registered successfully!");
  };

  return (
    <div className="reg-page">
      <div className="reg-header">
        <h1 className="reg-title">Create your account</h1>
        <p className="reg-subtitle">Join our platform and start connecting.</p>
      </div>

      <div className="reg-card">
        <p className="reg-small-label">I am a:</p>

        <div className="reg-role-grid">
          <button
            type="button"
            className={`reg-role-tile ${role === "business" ? "is-active" : ""}`}
            onClick={() => setRole("business")}
          >
            <div className="reg-role-title">Corporate Partner</div>
            <div className="reg-role-desc">Company seeking partnerships</div>
          </button>

          <button
            type="button"
            className={`reg-role-tile ${role === "vcse" ? "is-active" : ""}`}
            onClick={() => setRole("vcse")}
          >
            <div className="reg-role-title">Community Organisation</div>
            <div className="reg-role-desc">Sports club, charity, or group</div>
          </button>
        </div>

        <form className="reg-form" onSubmit={handleSubmit}>
          <label className="reg-label">
            Email address <span className="reg-required">*</span>
          </label>
          <input
            className="reg-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="reg-label">
            {role === "business" ? "Business Name" : "Organisation Name"}{" "}
            <span className="reg-required">*</span>
          </label>
          <input className="reg-input" type="text" />

        <label className="reg-label">
            Password <span className="reg-required">*</span>
          </label>
          <div className="reg-password-wrapper">
            <input
              className="reg-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
    </div>
  );
}
